// Event DAO

import db from "./db.js"

function EventDao() {
    //Attributes
    this.db = db;
    this.events = undefined;

    //Methods
    this.getAllEvents = () => {
        return new Promise((resolve, reject) => {
            if (this.events === undefined) {
                const sql = "SELECT * FROM events;";
                this.db.all(sql, [], (err, rows) => {
                    if (err) {
                        console.log(err.message);
                        reject(err);
                    }
                    else {
                        this.events = rows;
                        resolve(rows);
                    }
                })
            }
            else{
                resolve(this.events);
            }
        })
    }
}

export default EventDao;