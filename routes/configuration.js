const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const { upload } = require('../middleware/upload')
const db = require('../models')
const moment = require('moment')
const authentication = require('../middleware/authentication.js')

router.get("/", authentication.isLoggedIn, (req, res) => {
	db.Configuration.findOne({}, (err, configuration) => {
		res.render("configuration", {configuration: configuration})
	})
})

module.exports = router