const express = require('express')
const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require('../model/urlModel')
const redis = require("redis");
const { promisify } = require("util");
const { status } = require('express/lib/response');


const isValid = function (value) {
    if (typeof value === "undefined" || typeof value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}

const isValidRequestBody =function(requestBody){
    return Object.keys(requestBody).length !=0
}







//Connect to redis
const redisClient = redis.createClient(
    19565,
  "redis-19565.c212.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("ATr4txTufbPFE6LIC28LtTxvgy5U9hk8", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



const baseUrl = 'http:localhost:5000'

const createShort = async (req, res) => {
    try{
        if(!isValidRequestBody(req.body)){
         return res.status(400).send({status:false,message:"Invalid Request Parameter , Please Provide Url details"})
        }

        if(!isValid(req.body.longUrl)){
            return res.status(400).send({status:false,message:"Please Provide longurl"})
        }


    const longUrl  = req.body.longUrl.trim()

    if (!validUrl.isUri(longUrl)) {
        return res.status(401).send({ status: false, message: 'Invalid  longUrl' })
    }
const checkingdup = await urlModel.findOne({longUrl:longUrl})

if(checkingdup)
return res.status(400).send({status:false, message: "it is a duplicate url already saved in database"})

    const urlCode = shortid.generate()

// checking longurl in cache

        let checkUrl = await GET_ASYNC(`${longUrl}`)
           if(checkUrl){
               return res.status(200).send({status:true,data:JSON.parse(checkUrl)})
           }
  // checking longurl in db   

            let url = await urlModel.findOne({ longUrl }) 
            if (url) {
               return res.status(200).send({status:true , data:url})
            }
            
                const shortUrl = baseUrl + '/' + urlCode

              const  urlD = { longUrl, shortUrl, urlCode }
              const urlNew = await urlModel.create(urlD)
//set data in cache
              await SET_ASYNC(`${longUrl}`,JSON.stringify(urlD))
              return res.status(201).send({status:true, message:"Url Created successfully" , data:urlNew})
            
        
        }
        catch (err) {
            console.log(err)
             return res.status(500).send('Server Error')
        }
    }



/******************************************************************************** */

const getUrl = async (req, res) => {
    try{
         const urlCode = req.params.urlCode
         if(!isValid(urlCode)){
             return res.status(400).send({status:false , message:"Please provide valid url"})
         }
// checking in cache
         const checkUrl = await GET_ASYNC(`${urlCode}`)
         if(checkUrl){
             return res.status(301).redirect(JSON.parse(checkUrl))
         }
 //checking in DB        
         const url = await urlModel.findOne({urlCode:urlCode})
         if(!url){
             return res.status(404).send({status:false,message:"No url Found"})
         }
// set in cache

         await SET_ASYNC(`${urlCode}`,JSON.stringify(url.longUrl))
         return res.status(301).redirect(url.longUrl)

    }catch(err){
        console.error(err)
           return res.status(500).send({status:false,Error:err.message})
    }
}
   
    

module.exports.createShort = createShort
module.exports.getUrl = getUrl






