// Game components

import { useContext } from "react";
import { Row, Col } from "react-bootstrap"
import UndergroundContext from "../contexts/UndergroundContext";

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
    const isSolution = props.solution? true : false;
    const segments = isSolution? props.solution.map(segmentId => underground.segments[segmentId]) : underground.segments;
    const gameMode = props.gameMode? true: false;
    
    return <div className="" height="70vh">
        <svg viewBox="0 0 1000 1000" height="100%" weight="100%">
            {!gameMode &&  <SegmentsDisplay segments={segments} isSolution={isSolution} />}
            <StationsDisplay gameMode={gameMode} />
        </svg>
    </div>
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
            strokeWidth="6" stroke={!props.isSolution? line.color : "yellow"} />
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
         <text x={station.name_x} y={station.name_y} fontSize="14" fill="black" fontWeight="bold">
            {station.name}
        </text>

    </>
}


export { GameInstruction, GameMap };