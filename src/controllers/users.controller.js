import { connectionDB } from "../database/db.js";
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from "uuid";

export async function signUp(req,res){
console.log(req.body)
const {name,email,password} = req.body;
const passwordHash = bcrypt.hashSync(password, 10);
    try {
        await connectionDB.query(
            "INSERT INTO users (name,email,password) VALUES ($1,$2,$3);",
            [name,email,passwordHash]
          );
        res.sendStatus(201)
}       
    catch (err) {
  res.status(422).send(err.message);
}
}




export async function signIn(req,res){
    const {email,password} = req.body

    const token = uuidV4()
        try {
          const {rows} = await connectionDB.query("SELECT * FROM users WHERE email =$1",[email])
          console.log(rows[0].id)
          await connectionDB.query(
            'INSERT INTO sessions ("userId",token) VALUES ($1,$2);',
             [rows[0].id,token]
           );
            res.send(token).status(200)
            return
    }       
        catch (err) {
      res.status(422).send(err.message);
    }

}

export async function usersMe(req,res){
  const {authorization} = req.headers
  const token = authorization?.replace("Bearer ","")
  try{
    const {rows} = await connectionDB.query("SELECT * FROM sessions WHERE token =$1",[token])
    const user = await connectionDB.query("SELECT * FROM users WHERE id =$1",[rows[0].userId])
    const myLinks = await connectionDB.query('SELECT u.id,u.name, SUM(a."visitCount") AS "visitCount",json_agg(a.*)as "shortenedUrls"FROM users u JOIN urls a ON a."userId"=u.id WHERE a."userId" = $1 GROUP BY u.id',[rows[0].userId])
    res.send(myLinks.rows[0]).status(200)
  }
  catch (err) {
    res.status(422).send(err.message);
  }
}

export async function logoutUser(){
  
}