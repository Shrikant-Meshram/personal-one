const express = require('express')
const router = express.Router()
const validUrl = require('valid-url')
const shortid = require('shortid')
const urlController = require('../controller/urlController')


router.post('/url/shorten',urlController.shorten)
router.get('/:urlCode',urlController.getUrl)
module.exports=router