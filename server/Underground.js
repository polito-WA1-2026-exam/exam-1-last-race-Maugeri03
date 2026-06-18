// Underground data model

function Underground({ stations, lines, segments } = {}) {
    //Attributes
    this.stations = stations ? stations : {};
    this.lines = lines ? lines : {};
    this.segments = segments ? segments : {};

    //Private attributes and methods
    const MIN_DISTANCE = 3;

    //For getDepartureAndArrival function 
    const getRand = (max) => {
        return Math.floor(Math.random() * (max));
    }

    // Methods
    this.getDepartureAndArrival = () => {
        let valid = false;
        let departure;
        let arrival;
        let possibleSolution = [];
        const arrayStationIds = Object.keys(this.stations);
        while (!valid) {
            let found = false;
            departure = arrayStationIds[getRand(arrayStationIds.length)];
            arrival = arrayStationIds[getRand(arrayStationIds.length)];
            const queue = [];
            const tree = {};
            queue.push({ from: departure, to: departure, segment_id: undefined });
            while (!found && queue.length != 0) {
                const segment = queue.shift();
                const next = segment.to;
                if (tree[next] == undefined) {
                    tree[next] = {station_id:segment.from, segment_id:segment.segment_id};
                    if (next == arrival) {
                        found = true;
                    }
                    else {
                        Object.entries(this.segments)
                            .filter(([id, segment]) => (segment.id_station1 == next && tree[segment.id_station2] == undefined) || (segment.id_station2 == next && tree[segment.id_station1] == undefined))
                            .forEach(([id, segment]) => {
                                if(segment.id_station1 == next) queue.push({from:segment.id_station1, to:segment.id_station2, segment_id:id});
                                else queue.push({from:segment.id_station2, to:segment.id_station1, segment_id:id});
                            });
                    }
                }
            }
            if (found) {
                let next = arrival;
                let count = 0;
                possibleSolution = [];
                while (departure != next) {
                    count++;
                    const next_segmentId = tree[next]["segment_id"];
                    possibleSolution.unshift(next_segmentId);
                    next = tree[next]["station_id"];
                }
                if (count >= MIN_DISTANCE) {
                    valid = true;
                }
            }
        }
        return { departure, arrival, possibleSolution };
    };
};

export default Underground;