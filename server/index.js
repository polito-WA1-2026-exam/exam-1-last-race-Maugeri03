// Server

import express from "express";
import passport from "passport";
import LocalStrategy from "passport-local"
import session from "express-session";
import UserDao from "./UserDao.js";

// ------- Server initialization ---------
const app = express();
const port = 3001;
const PREFIX = "/api"
const userDao = new UserDao();

// ------- JSON middleware ---------
app.use(express.json());


// ------- Session middleware ---------
app.use(session({
    secret: "secret key",
    resave: false,
    saveUninitialized: false
}));


// ------- Passport middleware ---------
//Authentication
passport.use(new LocalStrategy({usernameField: "email", passwordField: "password"}, async function verify(email, password, callback) {
    try {
        const user = await userDao.getUserByCredentials(email, password);
        if (user === undefined) {
            callback(null, false, { message: "Invalid email or password" });
        }
        else {
            callback(null, user);
        }
    }
    catch(err){
        callback({ message: `Internal Server Error` });
    }
}));

//Session
passport.serializeUser((user, callback) => {
    callback(null, { id: user.id, email: user.email, username: user.username, best_score:user.best_score});
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
            if(err) return res.status(500).json(info);
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