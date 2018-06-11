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
router.get("/reset/password/new", authentication.reportAccess, (req, res) => {
	if(req.session.password){
		res.render("./configuration/resetPassword")
	}else{
		res.redirect("/configuration/reset/password")
	}
	
})
router.get("/reset/password",authentication.reportAccess,(req,res)=>{
	res.render("./configuration/oldPassword")
})
router.post("/reset/password/new",authentication.reportAccess,(req,res)=>{
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
router.post("/reset/password",(req,res)=>{
	db.Configuration.findOne({}, (err, configuration) => {
		hash=configuration.password;
		if(bcrypt.compareSync(req.body.password, hash)) {
			session=req.session;
			session.password=req.user._id;
			res.redirect("/configuration/reset/password/new")
			console.log(session)
		} else {
			res.redirect('/configuration/reset/password')
		}
	})
})

// Payroll
router.get("/reset/password/payroll",authentication.reportAccess,(req,res)=>{
	res.render("./configuration/payrollOldPassword")
})
router.get("/reset/password/new/payroll", authentication.reportAccess, (req, res) => {
	if(req.session.payrollPassword){
		res.render("./configuration/resetPayrollPassword")
	}else{
		res.redirect("/configuration/reset/password/payroll")
	}
})
router.post("/reset/password/new/payroll",authentication.reportAccess,(req,res)=>{
	var password=req.body.password;
	bcrypt.hash(password, 10, function(err, hash) {
		db.Configuration.update({}, { $set: {
			payrollPassword: hash
		}}, function (err) {
			if (err) console.log(err);
			res.redirect("/dashboard")

		});
  // Store hash in database
});
})
router.post("/reset/password/payroll",(req,res)=>{
	db.Configuration.findOne({}, (err, configuration) => {
		hash=configuration.payrollPassword;
		if(bcrypt.compareSync(req.body.password, hash)) {
			session=req.session;
			session.payrollPassword=req.user._id;
			res.redirect("/configuration/reset/password/new/payroll")
			console.log(session)
		} else {
			res.redirect('/configuration/reset/password/payroll')
		}
	})
})
module.exports = router