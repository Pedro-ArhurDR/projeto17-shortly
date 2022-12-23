import { connectionDB } from "../database/db.js";
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from "uuid";
import dayjs from "dayjs";
export async function signUp(req,res){
console.log(req.body)
const {name,email,password} = req.body;
const now = dayjs().format('YYYY-MM-DD')
console.log(now)
const passwordHash = bcrypt.hashSync(password.toString(), 10);
    try {
        await connectionDB.query(
            'INSERT INTO users (name,email,password,"createdAt") VALUES ($1,$2,$3,$4);',
            [name,email,passwordHash,now]
          );
        res.sendStatus(201)
}       
    catch (err) {
  res.status(422).send(err.message);
  return
}
}




export async function signIn(req,res){
    const {email,password} = req.body
    const now = dayjs().format('YYYY-MM-DD')
    const token = uuidV4()
        try {
          const {rows} = await connectionDB.query("SELECT * FROM users WHERE email =$1",[email])
          console.log(rows[0].id)
          await connectionDB.query(
            'INSERT INTO sessions ("userId",token,"createdAt") VALUES ($1,$2,$3);',
             [rows[0].id,token,now]
           );
            res.send(token).status(200)
            return
    }       
        catch (err) {
      res.status(422).send(err.message);
      return
    }

}

export async function usersMe(req,res){
  const {authorization} = req.headers
  const token = authorization?.replace("Bearer ","")
  try{
    const {rows} = await connectionDB.query("SELECT * FROM sessions WHERE token =$1",[token])
    const myLinks = await connectionDB.query('SELECT u.id,u.name, SUM(a."visitCount") AS "visitCount",json_agg(a.*)as "shortenedUrls"FROM users u JOIN urls a ON a."userId"=u.id WHERE u.id = $1 GROUP BY u.id',[rows[0].userId])
    const emptyLinkUser = await connectionDB.query(`SELECT u.id,u.name, 
    0 AS "visitCount",null as "shortenedUrls" FROM users u 
     WHERE u.id = $1 GROUP BY u.id`,[rows[0].userId])

     //caso o usuario nao tenha links cadastrados, a query é diferente para evitar retornar nada
     if(myLinks.rows.length===0){
      res.send(emptyLinkUser.rows[0]).status(200)
      return
     }
    console.log(myLinks.rows.length)
    res.send(myLinks.rows[0]).status(200)
  }
  catch (err) {
    res.status(422).send(err.message);
    return
  }
}

export async function logoutUser(req,res){
  const {authorization} = req.headers
  const token = authorization?.replace("Bearer ","")
  try{
    await connectionDB.query("DELETE FROM sessions WHERE token=$1", [token]);
    res.sendStatus(204)
}
  catch (err) {
    res.status(422).send(err.message);
    return
  }
}