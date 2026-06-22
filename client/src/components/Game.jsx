// Game components

import { useContext, useEffect, useState } from "react";
import { Row, Col, Button, Card, ListGroup } from "react-bootstrap"
import { useNavigate, useLocation } from "react-router";
import UndergroundContext from "../contexts/UndergroundContext";
import API from "../api/api";
import UserContext from "../contexts/UserContext";


function GameInstruction(props) {
    return (<div className="bg-light border rounded my-3 p-3">
        {/* Title */}
        <Row>
            <h2 className="text-center">Welcome in Last Race</h2>
        </Row>
        {/* Instructions */}
        <Row>
            <h3 className="">Instructions</h3>
        </Row>
        <Row>
            <h5>Phase 1: Study the map</h5>
        </Row>
        <Row>
            <p>
                When you log in, you will see the complete, fully colored underground map featuring different lines and stations.
                Take all the time you need to observe the network, study the interchanges, and figure out how the different lines
                connect to each othe. Once you feel confident that you have memorized your
                way around the city, simply click the "Start Game" button to begin your challenge.
            </p>
        </Row>
        <Row>
            <h5>Phase 2: Connect the stations</h5>
        </Row>
        <Row>
            <p>
                As soon as you start the game, all the lines connecting the stations will completely disappear from the map,
                leaving only the station dots, and you will be given a specific Starting Station and a Destination Station. A strict
                90-second timer will immediately start ticking down, during which you must select in order the right segments to connect
                your starting point to your destination. You must rely purely on your memory to follow the actual subway connections without
                creating fake shortcuts.
            </p>
        </Row>
        <Row>
            <h5>Phase 3: Result</h5>
        </Row>
        <Row>
            <p>
                If you successfully submitted a valid route in time, your journey begins with a fixed budget of coins (20).
                As you virtually travel through each station on your selected route, a random event will occur to test your luck,
                ranging from good surprises that reward you with extra coins to bad encounters like delays or pickpockets that deduct
                from your budget. Once you reach your final destination, your remaining coins will become your final score, so cross
                your fingers, survive the trip, and try to beat your personal best to climb the global leaderboard!
            </p>
        </Row>
    </div>)
}


function GameMap(props) {
    const underground = useContext(UndergroundContext);
    const isSolution = props.solution ? true : false;
    const segments = isSolution ? props.solution.map(segmentId => underground.segments[segmentId]) : underground.segments;
    const gameMode = props.gameMode ? true : false;

    return (
        <svg viewBox="0 0 1000 1000" className="h-100 w-100">
            {!gameMode && <SegmentsDisplay segments={segments} isSolution={isSolution} />}
            <StationsDisplay gameMode={gameMode} />
        </svg>)

}


function SegmentsDisplay(props) {
    return <>
        {Object.entries(props.segments).map(([id, segment]) => <SegmentDisplay key={id} segment={segment} isSolution={props.isSolution} />)}
    </>
}


function SegmentDisplay(props) {
    const underground = useContext(UndergroundContext);
    const station1 = underground.stations[props.segment.id_station1];
    const station2 = underground.stations[props.segment.id_station2];
    const line = underground.lines[props.segment.id_line];

    return <>
        <line x1={station1.station_x} y1={station1.station_y}
            x2={station2.station_x} y2={station2.station_y}
            strokeWidth="6" stroke={!props.isSolution ? line.color : "black"} />
    </>

}


function StationsDisplay(props) {
    const underground = useContext(UndergroundContext);
    const stations = underground.stations;

    return <>
        {Object.entries(stations).map(([id, station]) => <StationDisplay key={id} station={station} gameMode={props.gameMode} />)};
    </>
}


function StationDisplay(props) {
    const underground = useContext(UndergroundContext);
    const lines = underground.lines;
    const station = props.station;
    return <>
        {/* Interchanged station*/}
        {((!props.gameMode && station.id_lines.length > 1) || props.gameMode) && <circle cx={station.station_x} cy={station.station_y} r="9" fill="white" stroke="black" strokeWidth="4"></circle>}
        {/* Normal station */}
        {(!props.gameMode && station.id_lines.length == 1) && <circle cx={station.station_x} cy={station.station_y} r="7" fill="white" stroke={lines[station.id_lines[0]].color} strokeWidth="3"></circle>}

        {/* Stations' name */}
        <text x={station.name_x} y={station.name_y} fontSize="17" fill="black" fontWeight="bold" textAnchor="middle" >
            {station.name}
        </text>

    </>
}


function GameStartButton(props) {
    const navigate = useNavigate();
    const [isWaiting, setIsWaiting] = useState(false);

    async function start() {
        setIsWaiting(true);
        try {
            const res = await API.startGame();
            const gameSession = { departure: res.departure, arrival: res.arrival, timeLimit: res.timeLimit };
            navigate("/game", { state: gameSession });
        }
        catch (err) {
            navigate("/error", { state: err });
        }
        finally {
            setIsWaiting(false);
        }
    };

    return (
        <Button variant={!isWaiting ? "primary" : "secondary"} onClick={start} disabled={isWaiting} >{!isWaiting ? "New Game" : "Starting ..."}</Button>
    )
}


function GameSession(props) {
    const underground = useContext(UndergroundContext);
    const stations = underground.stations;
    const location = useLocation();
    const gameSession = location.state;
    const [timer, setTimer] = useState(gameSession.timeLimit);
    const [userSolution, setUserSolution] = useState([]);
    const [nonSelectedSegments, setNonSelectedSegments] = useState(shuffle(Object.keys(underground.segments)));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    function solutionAddSegment(segmentId) {
        setUserSolution(solution => solution.concat(segmentId));
        setNonSelectedSegments(segments => segments.filter(seg => seg != segmentId));
    }

    function solutionRemoveSegment(segmentId) {
        const index = userSolution.indexOf(segmentId);
        const newUserSolution = userSolution.slice(0, index);
        const removedSegments = userSolution.slice(index);
        setUserSolution(newUserSolution);
        setNonSelectedSegments(segments => segments.concat(removedSegments));
    }

    function submit() {
        setIsSubmitted(true);
    }

    //For having a casual order in displaying the cards
    function shuffle(vector) {
        const randomVector = [...vector];

        for (let i = randomVector.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (vector.length));
            [randomVector[i], randomVector[j]] = [randomVector[j], randomVector[i]];
        }
        return randomVector;
    }

    //For decreasing the timer
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimer(timer => timer - 1);
        }, 1000);
        return () => { clearInterval(intervalId); };
    }, []);

    //For submitting the solution
    useEffect(() => {
        if (timer > 0 && !isSubmitted) return;
        navigate("/game-solution", { state: userSolution });
    }, [timer, userSolution, isSubmitted, navigate])

    return <>
        {/* Title */}
        <Row className="mt-3">
            <h2 className="text-center">Build the path !</h2>
        </Row>
        {/* Information */}
        <Row className="justify-content-center">
            <Col className="col-7">
                {/* Information */}
                <div className="bg-light border rounded p-3 text-center">
                    <h4>{`Timer: ${timer}`}</h4>
                    <h4>{`Departure: ${stations[gameSession.departure].name}`}</h4>
                    <h4>{`Arrival: ${stations[gameSession.arrival].name}`}</h4>
                </div>
            </Col>
            <Col className="col-6">
            </Col>
        </Row>
        {/* Cards + map */}
        <Row className="my-4">
            {/* Cards */}
            <Col className="col-7">
                <GameCards nonSelectedSegments={nonSelectedSegments} userSolution={userSolution} addSegment={solutionAddSegment} removeSegment={solutionRemoveSegment} />
            </Col>
            {/* Map */}
            <Col className="col-5 d-flex flex-column justify-content-center">
                <div className="map border rounded mb-3">
                    <GameMap gameMode={true} />
                </div>
                <GameSubmitButton submit={submit} />
            </Col>
        </Row>
    </>
}


function GameCards(props) {
    const underground = useContext(UndergroundContext);
    const segments = underground.segments;
    return (
        <div className="d-flex flex-wrap justify-content-center gap-3">
            {/* Selected cards */}
            {props.userSolution.map(segmentId =>
                <GameCard key={segmentId} segment={segments[segmentId]} id={segmentId} addSegment={props.addSegment} removeSegment={props.removeSegment} isSelected={true} />
            )}

            {/* Other cards */}
            {props.nonSelectedSegments.map(segmentId =>
                <GameCard key={segmentId} segment={segments[segmentId]} id={segmentId} addSegment={props.addSegment} removeSegment={props.removeSegment} isSelected={false} />
            )}
        </div>)
}


function GameCard(props) {
    const underground = useContext(UndergroundContext);
    const stations = underground.stations;
    const [isSelected, setIsSelected] = useState(props.isSelected);

    function toggle() {
        if (isSelected) {
            props.removeSegment(props.id);
        }
        else {
            props.addSegment(props.id);
        }
        setIsSelected(value => { return !value });
    }

    return (
        <Card border={!isSelected ? "secondary" : "success"} className={`game-card clickable ${isSelected ? "border-4" : ""}`} onClick={toggle} >
            <Card.Header className={`text-center ${isSelected ? "bg-success-subtle" : ""} `} >Segment</Card.Header>
            <Card.Body className="p-3">
                <Card.Text className="text-center">
                    {stations[props.segment.id_station1].name}
                    <br />
                    {stations[props.segment.id_station2].name}
                </Card.Text>
            </Card.Body>
        </Card>

    )
}


function GameSubmitButton(props) {
    return <Button onClick={props.submit} >Submit</Button>
}


function GameResult(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const userSolution = location.state;
    const userContext = useContext(UserContext);
    const [result, setResult] = useState({ valid: undefined, coins: undefined, events: undefined, possibleSolution: undefined });
    const [newRecord, setNewRecord] = useState(false);

    useEffect(() => {
        async function submitSolution() {
            try {
                const res = await API.submitSolution(userSolution);
                setResult({ valid: res.valid, coins: res.coins, events: res.events, possibleSolution: res.possibleSolution });
                if (res.coins > userContext.user.best_score) {
                    setNewRecord(true);
                    userContext.setUser(user => ({ ...user, best_score: res.coins }));
                }
            }
            catch (err) {
                navigate("/error", { state: err });
            }
        }
        submitSolution();
    }, [])

    return <>
        {result.valid === undefined && <h2 className="text-center mt-4">Loading ...</h2>}
        {result.possibleSolution !== undefined && <div>
            {/* Title */}
            <Row className="mt-3"><h2 className="text-center">Game result</h2></Row>
            <Row className="align-items-center">
                {/* Result information */}
                <Col className="pt-2">
                    <div className="bg-light border rounded d-flex flex-column p-2 gap-3">
                        {!result.valid && <GameResultInfoLose userSolution={userSolution} />}
                        {result.valid && <GameResultInfoWin userSolution={userSolution} result={result} />}
                        <GameResultInfo result={result} newRecord={newRecord} />
                    </div>

                </Col>
                {/* Map */}
                <Col className="col-5 d-flex flex-column justify-content-center">
                    <h3 className="text-center">{result.valid ? "Your solution" : "A possible solution"}</h3>
                    <div className="map border rounded mb-3">
                        <GameMap solution={result.valid ? userSolution : result.possibleSolution} />
                    </div>
                </Col>
            </Row>
        </div>}
    </>
}

function GameResultInfoLose(props) {
    const underground = useContext(UndergroundContext);
    const segments = underground.segments;
    const stations = underground.stations;

    return (
        <>
            <h4 className="text-center">You lost !</h4>
            <div>
                <h5 className="mb-2">{`Your solution: ${props.userSolution.length == 0 ? "empty" : ""}`}</h5>
                <ListGroup as="ol" numbered>
                    {props.userSolution.map(segmentId =>
                        <ListGroup.Item key={segmentId} className="border-0 bg-transparent" >{`${stations[segments[segmentId].id_station1].name} - ${stations[segments[segmentId].id_station2].name}`}</ListGroup.Item>
                    )}
                </ListGroup>
            </div>
        </>
    )
}


function GameResultInfoWin(props) {
    const underground = useContext(UndergroundContext);
    const segments = underground.segments;
    const stations = underground.stations;

    return (
        <>
            <h4 className="text-center">You won !</h4>
            <div>
                <h5 className="mb-2">Events:</h5>
                <ListGroup as="ol">
                    {props.userSolution.map((segmentId, i) =>
                        <ListGroup.Item key={segmentId} className="border-0 bg-transparent d-flex" >
                            <span className="col-4 text-center">{`${i}. ${stations[segments[segmentId].id_station1].name} - ${stations[segments[segmentId].id_station2].name}`}</span>
                            <span className="col-8 text-center">{`${props.result.events[i].description}  (${props.result.events[i].effect})`}</span>

                        </ListGroup.Item>
                    )}
                </ListGroup>
            </div>
        </>
    )

}


function GameResultInfo(props) {
    const userContext = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <>
            {/* Coins information */}
            <div>
                {/* Case: no record */}
                {!props.newRecord && <h5 className="">{`Coins earned: ${props.result.coins}`}</h5>}
                {!props.newRecord && <h5 className="">{`Personal record: ${userContext.user.best_score}`}</h5>}
                {/* Case: record */}
                {props.newRecord && <h5 className="">{`Coins earned: ${props.result.coins} (New record !)`}</h5>}
            </div>
            {/* Buttons */}
            <div className="d-flex justify-content-center gap-5 mb-2">
                <div className="col-3 d-grid"><GameStartButton /></div>
                <div className="col-3 d-grid"><Button onClick={() => navigate("/")} >Back to home</Button></div>

            </div>
        </>

    )
}

export { GameInstruction, GameMap, GameStartButton, GameSession, GameResult };