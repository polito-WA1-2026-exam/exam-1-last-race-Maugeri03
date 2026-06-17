// DB access

import sqlite from "sqlite3"

const db = new sqlite.Database("db.sqlite", (err)=>{
    if(err){
        console.log(err.message);
        throw err;
    } 
});

export default db;