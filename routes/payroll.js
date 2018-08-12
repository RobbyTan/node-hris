const querystring = require('querystring'); 
const express = require('express')
const router = express.Router()
const methodOverride = require('method-override')
const { upload } = require('../middleware/upload')
const xlsx = require('xlsx')
const db = require('../models')
const bcrypt = require('bcrypt')
const authentication = require('../middleware/authentication.js')

router.use(methodOverride('_method'));

router.get("/access", authentication.payrollAccess(true), (req, res) => {
	const queryString = querystring.stringify({continueUrl: req.query.continueUrl});
  res.render('./partials/accessView', {
    title: 'Payroll',
    postUrl: '/payroll/access?'+queryString
  });
})
router.post("/access", authentication.payrollAccess(true), async(req, res) => {
	let configuration = await db.Configuration.findOne({});
  let hash = configuration.payrollPassword;
  if (bcrypt.compareSync(req.body.password, hash)) {
    req.session.payrollUserId = req.user._id.toString();
    res.redirect(req.query.continueUrl);
  } else {
    res.redirect('back');
  }
})

router.get("/", authentication.payrollAccess(), (req, res) => {
	res.render("./payroll/viewPayroll")
})

router.get("/view/manual", authentication.payrollAccess(), (req, res) => {
	db.Configuration.findOne({}, (err, configuration) => {
		if (err) console.log(err);
		else {
			res.render("./payroll/payrollDosen", {configuration: configuration});
		}
	});
})

router.get("/view/generatedpayroll", authentication.payrollAccess(), (req, res) => {
	db.PayrollReport.find({}).sort({endDate: -1}).exec(function(err, payrollReports) {
		console.log(payrollReports)
		res.render("./payroll/generatedPayroll", {payrollReports: payrollReports});
	});
})
router.get("/view/generatedpayroll/:id", authentication.payrollAccess(), async(req,res) => {
	let configuration = await db.Configuration.findOne({});
	let payrollReport = await db.PayrollReport.findById(req.params.id);
	res.render("./payroll/generatedPayrollDetail", {
		configuration: configuration,
		payrollReport: payrollReport
	});
})

router.get('/salary', authentication.payrollAccess(), async(req, res) => {
	res.render('payroll/uploadSalary');
})
router.put('/salary', authentication.payrollAccess(), upload.single('file'), async(req, res) => {
	if (!req.file) {
    return res.status(422).json({
      error: 'Please Upload a file'
    })
  }
  let toJson = function(workbook) {
    let result = {}
    workbook.SheetNames.forEach(function (sheetName) {
      let roa = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1})
      if (roa.length) result[sheetName] = roa
    })
    return JSON.stringify(result, 2, 2)
	}

	let workbook;
  try {
		let result = {}
		workbook = xlsx.readFile(req.file.path)
    workbook.SheetNames.forEach(function (sheetName) {
      let roa = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1})
      if (roa.length) result[sheetName] = roa
		})
		
    let data = result['Sheet1']
    data.forEach(async(row, idx) => {
			if (idx === 0) return
			try {
				let employee = await db.Fulldata.findOne({nik: row[0]});
				let cleanedSalary = row[2].replace(/[^0-9]/g, '');
				employee.jumlah_gaji_saat_ini = parseInt(cleanedSalary);
				await employee.save();
			} catch (err) {
				console.log('error updating salary', err);
			}
    })
  } catch (err) {
    console.log(err)
    return res.status(422).json({
      error: 'Error'
    })
  }
  return res.status(200).send(toJson(workbook))
})

module.exports = router
