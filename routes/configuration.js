const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const { upload } = require('../middleware/upload')
const db = require('../models')
const moment = require('moment')
const authentication = require('../middleware/authentication.js')
const bcrypt = require('bcrypt')


router.get("/", authentication.isLoggedIn, (req, res) => {
	db.Configuration.findOne({}, (err, configuration) => {
		res.render("configuration", {configuration: configuration})
	})
})
router.get("/reset/password", authentication.reportAccess, (req, res) => {
	res.render("./configuration/resetPassword")
})
router.post("/reset/password",authentication.reportAccess,(req,res)=>{
	var password=req.body.password;
	bcrypt.hash(password, 10, function(err, hash) {
		db.Configuration.update({}, { $set: {
			password: hash
		}}, function (err) {
			if (err) console.log(err);
			res.redirect("/dashboard")

		});
  // Store hash in database
});

})


module.exports = router