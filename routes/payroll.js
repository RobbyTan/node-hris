const querystring = require('querystring')
const express = require('express')
const router = express.Router()
const methodOverride = require('method-override')
const { upload } = require('../middleware/upload')
const xlsx = require('xlsx')
const db = require('../models')
const bcrypt = require('bcrypt')
const authentication = require('../middleware/authentication.js')

const HEADER_HEIGHT = 1

router.use(methodOverride('_method'))

router.get('/access', authentication.payrollAccess(true), (req, res) => {
  const queryString = querystring.stringify({ continueUrl: req.query.continueUrl })
  res.render('./partials/accessView', {
    title: 'Payroll',
    postUrl: '/payroll/access?' + queryString
  })
})
router.post('/access', authentication.payrollAccess(true), async (req, res) => {
  let configuration = await db.Configuration.findOne({})
  let hash = configuration.payrollPassword
  if (bcrypt.compareSync(req.body.password, hash)) {
    req.session.payrollUserId = req.user._id.toString()
    res.redirect(req.query.continueUrl)
  } else {
    res.redirect('back')
  }
})

router.get('/menu',(req,res)=>{
  res.render('./payroll/uploadSalaryMenu')
})

router.get('/access/upload', authentication.payrollAccessUploadMonthly(true), (req, res) => {
  const queryString = querystring.stringify({ continueUrl: req.query.continueUrl })
  res.render('./partials/accessView', {
    title: 'Upload Payroll Monthly',
    postUrl: '/payroll/access?' + queryString
  })
})

router.post('/access/upload', authentication.payrollAccess(true), async (req, res) => {
  let configuration = await db.Configuration.findOne({})
  let hash = configuration.payrollPassword
  if (bcrypt.compareSync(req.body.password, hash)) {
    req.session.payrollUserId = req.user._id.toString()
    res.redirect(req.query.continueUrl)
  } else {
    res.redirect('back')
  }
})

router.get('/', authentication.payrollAccess(), (req, res) => {
  res.render('./payroll/viewPayroll')
})

router.get('/view/manual', authentication.payrollAccess(), (req, res) => {
  db.Configuration.findOne({}, (err, configuration) => {
    if (err) console.log(err)
    else {
      res.render('./payroll/payrollDosen', { configuration: configuration })
    }
  })
})

router.get('/view/generatedpayroll', authentication.payrollAccess(), (req, res) => {
  db.PayrollReport.find({}).sort({ endDate: -1 }).exec(function (err, payrollReports) {
    console.log(payrollReports)
    res.render('./payroll/generatedPayroll', { payrollReports: payrollReports })
  })
})
router.get('/view/generatedpayroll/:id', authentication.payrollAccess(), async (req, res) => {
  let configuration = await db.Configuration.findOne({})
  let payrollReport = await db.PayrollReport.findById(req.params.id)
  res.render('./payroll/generatedPayrollDetail', {
    configuration: configuration,
    payrollReport: payrollReport
  })
})

router.get('/salary', authentication.payrollAccess(), async (req, res) => {
  res.render('payroll/uploadSalary')
})
router.put('/salary', authentication.payrollAccess(), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(404).json({ error: true })

  try {
    let workbook = xlsx.readFile(req.file.path)
    let rows = xlsx.utils.sheet_to_json(workbook.Sheets['Sheet1'], { header: 1 }).slice(HEADER_HEIGHT)

    let employeesDict = {};
    (await db.Fulldata.find()).forEach(emp => { employeesDict[emp.nik] = emp })
    
    let invalidInfo = isPayrollExcelInvalid(rows, employeesDict)
    if (invalidInfo) {
      return res.status(404).json({ invalidInfo })
    }

    let failCounter = 0
    for (let row of rows) {
      try {
        let employee = employeesDict[row[0]]
        let cleanedSalary = row[2].replace(/[^0-9]/g, '')
        employee.jumlah_gaji_saat_ini = parseInt(cleanedSalary)
        await employee.save()
      } catch (err) {
        console.log(err)
        failCounter += 1
      }
    }
    return res.json({ success: failCounter === 0, failCounter })
  } catch (err) {
    console.log(err)
    return res.status(404).json({ success: true })
  }
})

function isPayrollExcelInvalid(rows, employeesDict) {
  let mandatoryColumns = [];
  [0, 1, 2].forEach(idx => {
    if (rows.filter(row => row[idx]).length !== rows.length) {
      mandatoryColumns.push(colExcel(idx))
    }
  })

  let mismatchTypeRows = []
  rows.forEach((row, rowIndex) => {
    if (!row[2].match(/^\d+$/)) {
      mismatchTypeRows.push(HEADER_HEIGHT + rowIndex + 1)
    }
  })

  let uninvitedPayrolls = rows.filter(row => !employeesDict[row[0]])
  
  if (uninvitedPayrolls.length || mandatoryColumns.length) {
    return {
      uninvitedPayrolls,
      mandatoryColumns,
      mismatchTypeRows
    }
  }
}

function colExcel (val) {
  let result = ''
  while (val) {
    let mod = val % 26
    result = String.fromCharCode('A'.charCodeAt(0) + mod) + result
    val = Math.floor(val / 26)
  }
  if (result.length > 1) result = String.fromCharCode(result.charCodeAt(0) - 1) + result.substr(1)
  return result
}

module.exports = router
