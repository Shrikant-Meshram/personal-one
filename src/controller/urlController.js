const express = require('express')
const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require('../model/urlModel')
const redis = require("redis");
const { promisify } = require("util");

const baseUrl = 'http:localhost:5000'



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





const shorten = async (req, res) => {
    const { longUrl } = req.body

    if (!validUrl.isUri(baseUrl)) {
        return res.status(401).send({ status: false, message: 'Invalid base URL' })
    }

    const urlCode = shortid.generate()

    if (validUrl.isUri(longUrl)) {
        try {

            let url = await urlModel.findOne({ longUrl })
            if (url) {
                res.send(url)
            }
            else {
                const shortUrl = baseUrl + '/' + urlCode

                url = new urlModel({ longUrl, shortUrl, urlCode })
                await url.save()
                res.status(201).send({ status: true, data: url })
            }
        }

        catch (err) {
            console.log(err)
            res.status(500).send('Server Error')
        }
    } else {
        res.status(401).send({ status: false, message: 'Invalid longUrl' })
    }
}



/******************************************************************************** */

const getUrl = async (req, res) => {
    try{
         const urlCode = req.params.urlCode

         const checkUrl = await GET_ASYNC(`${urlCode}`)
         if(checkUrl){
             return res.redirect(JSON.parse(checkUrl))
         }
         
         const url = await urlModel.findOne({urlCode:urlCode})


         await SET_ASYNC(`${urlCode}`,JSON.stringify(url.longUrl))
         return res.redirect(url.longUrl)

    }catch(err){
        console.error(err)
           return res.status(500).send({status:false,Error:err.message})
    }
}
   
    

module.exports.shorten = shorten
module.exports.getUrl = getUrl






// let cahcedProfileData = await GET_ASYNC(`${req.params.authorId}`)
// if(cahcedProfileData) {
//   res.send(cahcedProfileData)
// } else {
//   let profile = await authorModel.findById(req.params.authorId);
//   await SET_ASYNC(`${req.params.authorId}`, JSON.stringify(profile))
//   res.send({ data: profile });
// }