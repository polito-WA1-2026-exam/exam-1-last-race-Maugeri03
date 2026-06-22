// Event DAO

import db from "./db.js"

function EventDao() {
    //Attributes
    this.db = db;

    //Methods
    this.getAllEvents = () => {
        return new Promise((resolve, reject) => {
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
        })
    }
}

export default EventDao;