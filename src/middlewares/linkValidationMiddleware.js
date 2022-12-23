import { connectionDB } from "../database/db.js"
export async function shortUrlValidation(req,res,next){
    console.log('passando na validação')
    const {authorization} = req.headers
    const {url} = req.body
    console.log(url)
    if(!url){
        res.sendStatus(422);
        return
    }
    if(!authorization?.includes("Bearer")){
        res.sendStatus(401)
        return
    }
    const token = authorization?.replace("Bearer ","")
    try{
        const {rows} = await connectionDB.query("SELECT * FROM sessions WHERE token =$1",[token])
        if(rows.length===0){
            res.sendStatus(401)
            console.log('token invalido')
            return
        }
        console.log(rows)
    }
    catch(err){
        res.status(422).send(err.message);
    }
    next()
}

export async function urlByIdValidation(req,res,next){
    const {id} = req.params
    try{
        const {rows} = await connectionDB.query("SELECT * FROM urls WHERE id =$1",[id])
        console.log(rows)
        if(rows.length===0){
            res.sendStatus(404)
            return
        }
    }
    catch(err){
        return res.status(422).send(err.message);
    }
    console.log('passei daq')
    next()
}

export async function goToUrlValidation(req,res,next){
    const {shortUrl} = req.params
    console.log(shortUrl)
    try{
        const {rows} = await connectionDB.query('SELECT * FROM urls WHERE "shortUrl" =$1;',[shortUrl])
        if(rows.length===0){
            res.sendStatus(404)
            return
        }
    }
    catch(err){
        return res.status(422).send(err.message);
    }
    next()
}

export async function deleteUrlValidation(req,res,next){
    const {id} = req.params
    const {authorization} = req.headers
    if(!id){
        res.sendStatus(422);
        return
    }
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
        const {rows} = await connectionDB.query("SELECT * FROM urls WHERE id =$1",[id])
        if(rows.length===0){
            res.sendStatus(404)
            return
        }
        console.log(sessions.rows[0].userId)
        console.log(rows[0].userId)
        if(sessions.rows[0].userId != rows[0].userId){
            res.sendStatus(401)
            return
        }
    }
    catch(err){
       return res.status(422).send(err.message);
    }
    next()
}