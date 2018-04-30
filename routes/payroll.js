const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const db = require('../models')
const moment = require('moment')
const authentication = require('../middleware/authentication.js')

router.get("/",authentication.isLoggedIn,(req,res)=>{
	res.render("./payroll/payrollDosen")
})

module.exports = router