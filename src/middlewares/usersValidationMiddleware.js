
import { connectionDB } from '../database/db.js';
import bcrypt from "bcrypt"

export async function signUpValidation(req,res,next){
    const {email,password,confirmPassword} = req.body

    if(password != confirmPassword){
        res.sendStatus(422)
        return
    }

    try{
        const {rows} = await connectionDB.query("SELECT * FROM users;")
        for(let i=0; i< rows.length;i++ ){
            if(rows[i].email.includes(email)){
              console.log('contem email')
              res.sendStatus(409)
              return
            }
          }
        console.table(rows)
    }
    catch (err) {
        res.status(500).send(err.message);
        return
      }
    next()
}


export async function signInValidation(req,res,next){
    const {email,password} = req.body
    try{
        const {rows} = await connectionDB.query("SELECT * FROM users WHERE email =$1",[email])
        if(rows.length===0){
            res.sendStatus(401)
            return
        }
        console.log(email)      
         if(!bcrypt.compareSync(password,rows[0].password)){
            console.log(req.body)
            return res.sendStatus(401)
        }
    }
    catch (err) {
        res.status(500).send(err.message);
        return
      }
    next()
}


export async function usersMeValidation(req,res,next){
  const {authorization} = req.headers

  if(!authorization?.includes("Bearer")){
    res.sendStatus(401)
    return
}
  const token = authorization?.replace("Bearer ","")
    try{
      const sessions = await connectionDB.query("SELECT * FROM sessions WHERE token =$1",[token])
      if(sessions.rows.length===0){
          res.sendStatus(401)
          return
      }
      const {rows} = await connectionDB.query("SELECT * FROM users WHERE id =$1",[sessions.rows[0].userId])
      if(rows.length===0){
        res.sendStatus(404)
        return
      }
      console.log(rows)
    }
    catch (err) {
      res.status(500).send(err.message);
      return
    }
    next()
}