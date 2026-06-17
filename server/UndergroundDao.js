// Underground DAO

import db from "./db.js";
import Underground from "./Underground.js";

function UndergroundDao() {
    //Attributes
    this.db = db;
    this.underground = undefined;

    //Private methods (for getUnderground)
    const getAllStations = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM stations;";
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }
                else {
                    const stations = {};
                    rows.forEach(row => {
                        stations[row.id] = {name: row.name, station_x: row.station_x, station_y: row.station_y, name_x: row.name_x, name_y: row.name_y};
                    });
                    resolve(stations);
                }
            });
        });
    }


    const getAllLines = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM lines;";
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }
                else {
                    const lines = {};
                    rows.forEach(row => {
                        lines[row.id] = { name: row.name, color: row.color };
                    });
                    resolve(lines);
                }
            });
        });
    }


    const getAllSegments = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM segments;";
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }
                else {
                    const segments = {};
                    rows.forEach(row => {
                        segments[row.id] = { id_station1: row.id_station1, id_station2: row.id_station2, id_line: row.id_line };
                    });
                    resolve(segments);
                }
            });
        });
    }

    //Methods
    this.getUnderground = () => {
        return new Promise((resolve, reject) => {
            if (this.underground != undefined) {
                resolve(this.underground);
            }
            else {
                Promise.all([getAllStations(), getAllLines(), getAllSegments()])
                    .then(([stations, lines, segments]) => {
                        const underground = new Underground({ stations: stations, lines: lines, segments: segments });
                        this.underground = underground;
                        resolve(underground);
                    })
                    .catch(err => {
                        console.log(err.message);
                        reject(err);
                    });
            }
        })
    }

};

export default UndergroundDao;