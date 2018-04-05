const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const { upload } = require('../middleware/upload')
const db = require('../models')
const moment = require('moment')
const authentication = require('../middleware/authentication.js')

router.get("/", authentication.isLoggedIn, (req, res) => {
	/* 
	 *  run this in first run !important 
	 */
	// db.Configuration.create({
	// 	dosenTidakTetapMaxTime: "03.30"
	// })
	db.Configuration.findOne({}, (err, configuration) => {
		res.render("configuration", {configuration: configuration})
	})
})

router.post("/", authentication.isLoggedIn, (req, res) => {
	let maxTime = req.body.maxTime;
	db.Configuration.update({}, { $set: { 
		dosenTidakTetapMaxTime: maxTime
	}}, function (err) {
		if (err) console.log(err);
		res.redirect("/configuration")
	});
})

module.exports = router