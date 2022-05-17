const express = require('express')
const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require('../model/urlModel')


const baseUrl = 'http:localhost:5000'

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

module.exports.shorten = shorten

/******************************************************************************** */

const getUrl = async (req, res) => {
    try {

        const url = await urlModel.findOne({
            urlCode: req.params.urlCode
        })
        if (url) {

            console.log(url)
            return res.redirect(url.longUrl)

        }
        else {

            return res.status(404).send({status: false, message: 'No URL Found'})
        }

    }
    // exception handler
    catch (err) {
        console.error(err)
        res.status(500).send('Server Error')
    }
}


module.exports.getUrl = getUrl