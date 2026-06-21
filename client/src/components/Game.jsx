// Game components

import { useContext, useEffect, useState } from "react";
import { Row, Col, Button, Card } from "react-bootstrap"
import { useNavigate, useLocation } from "react-router";
import UndergroundContext from "../contexts/UndergroundContext";
import API from "../api/api";


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
            strokeWidth="6" stroke={!props.isSolution ? line.color : "yellow"} />
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
        <text x={station.name_x} y={station.name_y} fontSize="17" fill="black" fontWeight="bold">
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
            //TODO
            console.log(err);
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
    const [nonSelectedSegments, setNonSelectedSegments] = useState(Object.keys(underground.segments));
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


    function submit(){
        setIsSubmitted(true);
    }

    //For decreasing the timer
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimer(timer => timer-1);
        }, 1000);
        return () => { clearInterval(intervalId); };
    }, []);

    //For submitting the solution
    useEffect(()=>{
        if(timer > 0 && !isSubmitted) return;
        navigate("/game-solution", {state: userSolution});
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
                <GameSubmitButton submit={submit}/>
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
            <Card.Header className={`text-center ${isSelected? "bg-success-subtle":""} `} >Segment</Card.Header>
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


function GameSubmitButton(props){
    return <Button onClick={props.submit} >Submit</Button>
}

export { GameInstruction, GameMap, GameStartButton, GameSession };