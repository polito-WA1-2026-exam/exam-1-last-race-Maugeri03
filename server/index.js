// Server

import express from "express";
import passport from "passport";
import LocalStrategy from "passport-local"
import session from "express-session";
import cors from "cors";
import { body, query, validationResult } from "express-validator";
import dayjs from "dayjs";
import UserDao from "./UserDao.js";
import UndergroundDao from "./UndergroundDao.js";
import Underground from "./Underground.js";
import EventDao from "./EventDao.js";

// ------- Server initialization ---------
const app = express();
const port = 3001;
const PREFIX = "/api"
const userDao = new UserDao();
const undergroundDao = new UndergroundDao();
const eventDao = new EventDao();
const GAME_DURATION = 90;
const CHECK_OFFSET = 5;
const STARTER_COINS = 20;

// ------- JSON middleware ---------
app.use(express.json());


// ------- CORS middleware ---------
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};
app.use(cors(corsOptions));


// ------- Session middleware ---------
app.use(session({
    secret: "secret key",
    resave: false,
    saveUninitialized: false
}));


// ------- Passport middleware ---------
//Authentication
passport.use(new LocalStrategy({ usernameField: "email", passwordField: "password" }, async function verify(email, password, callback) {
    //Validation data
    if (!email.includes("@")) {
        callback(null, false, { message: "Invalid email or password" });
    }
    try {
        const user = await userDao.getUserByCredentials(email, password);
        if (user === undefined) {
            callback(null, false, { message: "Invalid email or password" });
        }
        else {
            callback(null, user);
        }
    }
    catch (err) {
        callback({ message: `Internal Server Error` });
    }
}));

//Session
passport.serializeUser((user, callback) => {
    callback(null, { id: user.id, email: user.email, username: user.username, best_score: user.best_score });
});


passport.deserializeUser((user, callback) => {
    callback(null, user);
});

app.use(passport.initialize());
app.use(passport.authenticate("session"));


// --------- isLoggedIn middleware ---------
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        res.status(401).json({ message: "Not authenticated" });
    }
}

// ------- Users API ---------
// GET /api/best-scores: return all the user's scores from begin position to end position in the global ranking
app.get(`${PREFIX}/best-scores`, isLoggedIn, [
    query("begin").notEmpty().withMessage("Begin field must be present").isInt({ min: 1 }).withMessage("Begin field must be greater or equal to 1"),
    query("end").notEmpty().withMessage("End field must be present").isInt().custom((param, { req }) => {
        if (param < req.query.begin) {
            throw new Error("End field must be greater than begin field");
        }
        return true;
    })],
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ message: "Wrong parameters", causes: result.array() });
        }
        try {
            const ranking = await userDao.getRanking(req.query.begin, req.query.end);
            res.status(200).send({ranking:ranking});
        }
        catch (err) {
            res.status(500).send({ message: "Internal Server Problem" });
        }
    })


// GET /api/game/underground: return the underground object (in JSON format)
app.get(`${PREFIX}/game/underground`, isLoggedIn, async (req, res) => {
    try {
        const underground = await undergroundDao.getUnderground();
        return res.status(200).send(underground);
    }
    catch (err) {
        return res.status(500).send({ message: "Internal Server Problem" });
    }
})


//POST api/game/start: start a new game. If there is still an valid game session, the user must wait until its end for
//starting a new one
app.post(`${PREFIX}/game/start`, isLoggedIn, async (req, res) => {
    const previousSession = req.session.gameSession;
    if (previousSession !== undefined && (!previousSession.checked && (dayjs().unix() - previousSession.begin) <= GAME_DURATION)) {
        return res.status(409).send({ message: "There is already a valid game session" });
    }
    try {
        const underground = await undergroundDao.getUnderground();
        const gameSession = underground.getDepartureAndArrival();
        req.session.gameSession = { ...gameSession, begin: dayjs().unix(), checked: false };
        return res.status(200).send({ departure: gameSession.departure, arrival: gameSession.arrival, timeLimit: GAME_DURATION });
    }
    catch (err) {
        return res.status(500).send({ message: "Internal Server Problem" });
    }
});


// POST api/game/submit: check if the solution is valid (if sent on time)
app.post(`${PREFIX}/game/submit`, [isLoggedIn, body("segmentsId").isArray({ min: 0 }).withMessage("SegmentsId must be present and must be an array")],
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ message: "Wrong parameters", causes: result.array() });
        }
        const gameSession = req.session.gameSession;
        if(!gameSession){
            return res.status(400).send({ message: "No active session" });
        }
        if (gameSession?.checked) {
            return res.status(200).send(req.session.gameResult);
        }
        if ((dayjs().unix() - gameSession?.begin) >= GAME_DURATION + CHECK_OFFSET) {
            return res.status(400).send({ message: "Time expired" });
        }
        try {
            req.session.gameSession.checked = true;
            const underground = await undergroundDao.getUnderground();
            const valid = underground.checkSolution(gameSession.departure, gameSession.arrival, req.body.segmentsId);
            if (valid) {
                const events = await eventDao.getAllEvents();
                let coins = STARTER_COINS;
                const list_events = [];
                for (let i = 0; i < req.body.segmentsId.length; i++) {
                    const rand = Math.floor(Math.random() * (events.length));
                    const event = events[rand];
                    coins += event.effect;
                    list_events.push(event);
                }
                coins = coins >= 0 ? coins : 0;
                if (coins > req.user.best_score) {
                    req.user.best_score = coins;
                    await userDao.updateBestScore(req.user.id, coins);
                }
                req.session.gameResult = { valid: valid, coins: coins, events: list_events, possibleSolution: [] };
                return res.status(200).send({ valid: valid, coins: coins, events: list_events, possibleSolution: [] });
            }
            else {
                req.session.gameResult = { valid: valid, coins: 0, possibleSolution: gameSession.possibleSolution, events: [] };
                return res.status(200).send({ valid: valid, coins: 0, possibleSolution: gameSession.possibleSolution, events: [] });
            }
        }
        catch (err) {
            return res.status(500).send({ message: "Internal Server Problem" });
        }
    });


// ------- Session API ---------
// POST /api/sessions:  creates a new session
app.post(`${PREFIX}/sessions`, (req, res, next) => {
    //Passport generates a middleware
    const middleware = passport.authenticate("local", (err, user, info) => {
        if (err) return res.status(500).json(info);
        if (!user) {
            return res.status(401).json(info);
        }
        req.login(user, (err) => {
            if (err) return res.status(500).json(info);
            return res.status(200).json(req.user);
        });
    });
    //The middleware is called
    middleware(req, res, next);
});


// GET /api/sessions/current: checks the presence of a current session
app.get(`${PREFIX}/sessions/current`, isLoggedIn, (req, res) => {
    res.status(200).json(req.user);
});

// DELETE /api/sessions/current:  delets the current session of an user
app.delete(`${PREFIX}/sessions/current`, isLoggedIn, (req, res) => {
    req.logOut((err) => {
        if (err) res.status(500).json({ message: "Internal Server Problems" });
        else res.status(200).end();
    });
});
// --------- Server activation ---------
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});