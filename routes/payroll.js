const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const db = require('../models')
const moment = require('moment')
const bodyParser = require('body-parser')
var sessions = require('express-session')
var app = express();
const bcrypt = require('bcrypt')
const authentication = require('../middleware/authentication.js')

app.use(bodyParser.urlencoded({extended: true}))
app.use(require("express-session")({
	secret : "UPH Medan",
	resave : false,
	saveUninitialized: false
}));

router.get("/",authentication.payrollAccess,(req,res)=>{
	res.render("./payroll/viewPayroll")
})

router.get("/view/manual",authentication.payrollAccess,(req,res)=>{
	db.Configuration.findOne({}, (err, configuration) => {
		if (err) console.log(err);
		else {
			res.render("./payroll/payrollDosen", {configuration: configuration});
		}
	});
})

router.get("/view/generatedpayroll",authentication.payrollAccess,(req,res)=>{
	db.PayrollReport.find({}).sort({endDate: -1}).exec(function(err, payrollReports) {
		console.log(payrollReports)
		res.render("./payroll/generatedPayroll", {payrollReports:payrollReports});
	});
})
router.get("/view/generatedpayroll/:id",authentication.payrollAccess, async (req,res) => {
	let configuration = await db.Configuration.findOne({});
	let payrollReport = await db.PayrollReport.findById(req.params.id);
	res.render("./payroll/generatedPayrollDetail", {
		configuration: configuration,
		payrollReport: payrollReport
	});
})

router.get("/access",authentication.access,(req,res)=>{
	res.render('./payroll/access')
})
router.post("/access",authentication.access,(req,res)=>{	
	db.Configuration.findOne({}, (err, configuration) => {
		hash=configuration.payrollPassword;
		if(bcrypt.compareSync(req.body.password, hash)) {
			session=req.session;
			session.payroll=req.user.username;
			res.redirect("/payroll")
			console.log(session.name)
		} else {
			res.redirect('/payroll/access')
		}
	})
})

module.exports = router
