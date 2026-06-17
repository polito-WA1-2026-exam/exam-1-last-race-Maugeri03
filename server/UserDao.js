// User DAO

import db from "./db.js"

function UserDao(){
    //Attributes
    this.db = db;

    //Methods
    this.getUser = (id)=>{
        return new Promise((resolve, reject)=>{
            const sql = "SELECT * FROM users WHERE id=?;"
            this.db.get(sql, [id], (err, row)=>{
                if(err){
                    console.log(err.message);
                    reject(err);
                }
                else{
                    resolve(row);
                }
            });
        });
    }


    this.getRanking = (begin, end)=>{
        return new Promise((resolve, reject)=>{
            const sql = "SELECT username, best_score FROM users ORDER BY best_score DESC LIMIT ? OFFSET ?;";
            this.db.all(sql, [end-begin+1, begin-1], (err, rows)=>{
                if(err){
                    console.log(err.message);
                    reject(err);
                }
                else{
                    resolve(rows);
                }
            });
        });
    }
}

export default UserDao;