const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const router = require('./router/route')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

mongoose.connect("mongodb+srv://Functionup_user1:xjCaggwJRDuZ6bjP@my-first-cluster.sfq4n.mongodb.net/project4Database",{
    useNewUrlParser:true
})
.then (() => console.log('mongoDB is connected '))
.catch(err => console.log(err))
app.use("/",router)

app.listen(process.env.PORT || 5000,function(){
    console.log("Express app running on PORT "+(process.env.PORT || 5000))
})
