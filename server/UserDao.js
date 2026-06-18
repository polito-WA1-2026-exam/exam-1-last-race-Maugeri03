// User DAO

import db from "./db.js"
import crypto from "crypto"

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


    this.getUserByCredentials = (email, password)=>{
        return new Promise((resolve, reject)=>{
            const sql = "SELECT * FROM users WHERE email=?;";
            this.db.get(sql, [email], (err, row)=>{
                if(err){
                    console.log(err.message);
                    reject(err);
                }
                else{
                    if(row === undefined){
                        resolve(undefined);
                    }
                    else{
                        crypto.scrypt(password, row.salt, 64, (err, hashedPassword)=>{
                            if(err){
                                console.log(err.message);
                                reject(err);
                            }
                            else{
                                if(crypto.timingSafeEqual(Buffer.from(row.hashed_password, "hex"), hashedPassword)){
                                    resolve({id:row.id, email:row.email, username:row.username, best_score:row.best_score});
                                }
                                else{
                                    resolve(undefined);
                                }
                            }
                        });
                    }
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


    this.updateBestScore = (id, best_score)=>{
        return new Promise((resolve, reject)=>{
            const sql = "UPDATE users SET best_score=? WHERE id=?;";
            this.db.run(sql, [best_score, id], (err)=>{
                if(err){
                    console.log(err.message);
                    reject(err);
                }
                else{
                    resolve();
                }
            });
        });
    };
}

export default UserDao;