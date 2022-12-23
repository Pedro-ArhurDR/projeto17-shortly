import { nanoid } from 'nanoid'
import { connectionDB } from '../database/db.js'
import dayjs from "dayjs";
export async function shortUrl(req,res){
    const {url} = req.body
    const {authorization} = req.headers
    const token = authorization?.replace("Bearer ","")
    console.log(url)
    const nano = nanoid(8)
    console.log(nano)
    const now = dayjs().format('YYYY-MM-DD')
    const link = {
        shortUrl:nano
    }

    try{
        const {rows} = await connectionDB.query("SELECT * FROM sessions WHERE token =$1",[token])
        await connectionDB.query(
            'INSERT INTO urls ("userId",url,"shortUrl","visitCount","createdAt") VALUES ($1,$2,$3,$4,$5);',
             [rows[0].userId,url,nano,0,now]
           );
        res.status(201).send(link)
}
    catch(err){
        res.status(422).send(err.message);
        return
}
}

export async function getUrlById(req,res){
    const {id} = req.params
    try{
        const { rows } = await connectionDB.query(
            'SELECT * FROM urls WHERE id=$1;',
            [id ]
          );
          const urlById={
            id:rows[0].id,
            shortUrl:rows[0].shortUrl,
            url:rows[0].url
          }
          console.log(rows)
          res.status(200).send(urlById)
    }
    catch(err){
        res.status(422).send(err.message);
        return
}
}

export async function goToShortUrl(req,res){
    const {shortUrl} = req.params
    try{
        const {rows} = await connectionDB.query('SELECT * FROM urls WHERE "shortUrl" =$1;',[shortUrl])
        const visitCounter = rows[0].visitCount + 1
        await connectionDB.query(
            'UPDATE urls SET "visitCount"=$1 WHERE "shortUrl"= $2 ',
            [visitCounter,shortUrl]
          );
        console.log(rows[0])
        res.status(200).redirect(rows[0].url)
    }
    catch(err){
        res.status(422).send(err.message);
        return
}
}

export async function deleteUrl(req,res){
    const {id} = req.params
    try{
        await connectionDB.query("DELETE FROM urls WHERE id=$1", [id]);
        res.sendStatus(204)
    }
    catch(err){
        res.status(422).send(err.message);
        return
}
}

export async function getRanking(req,res){
    try{
      const {rows} = await connectionDB.query(`SELECT u.id,u.name,
      COUNT(a.url) AS "linksCount",COALESCE(SUM(a."visitCount"),0) 
      AS "visitCount"
      FROM users u 
      LEFT JOIN urls a ON u.id= a."userId" GROUP BY u.id
      ORDER BY "visitCount" DESC LIMIT 10
        `)
        res.status(200).send(rows)
    }
    catch(err){
        res.status(422).send(err.message);
        return
    }
}