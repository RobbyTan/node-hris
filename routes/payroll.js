const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const db = require('../models')
const moment = require('moment')
const bodyParser = require('body-parser')
var sessions = require('express-session')
var app=express();

var session;
const authentication = require('../middleware/authentication.js')

app.use(bodyParser.urlencoded({extended: true}))
app.use(require("express-session")({
	secret : "UPH Medan",
	resave : false,
	saveUninitialized: false
}));

router.get("/",authentication.payrollAccess,(req,res)=>{
	if(req.session.name){
		res.render("./payroll/payrollDosen")
	}else{
		res.redirect("/payroll/access");
	}

})

router.get("/access",authentication.payrollAccess,(req,res)=>{
	res.render('./payroll/access')
})
router.post("/access",authentication.payrollAccess,(req,res)=>{	
	console.log(process.env)
	if(req.body.password == process.env.PASS){
		session=req.session;
		session.name=req.user.username;
		res.redirect("/payroll")
		console.log(session.name)
	}else{
		res.redirect('/payroll/access')
	}
	
})

module.exports = router