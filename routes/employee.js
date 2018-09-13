const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const { upload } = require('../middleware/upload')
const db = require('../models')
const auth = require('../middleware/authentication.js')

router.get('/', auth.isLoggedIn, (req, res) => {
  res.render('employee/index')
})

router.get('/new', auth.isLoggedIn, (req, res) => {
  res.render('employee/new')
})

router.get('/new/upload', auth.isLoggedIn, (req, res) => {
  res.render('employee/new-upload')
})

router.post('/new/upload', auth.isLoggedIn, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(422).json({
      error: 'Please Upload a file'
    })
  }
  let workbook
  let toJson = function toJson (workbook) {
    let result = {}
    workbook.SheetNames.forEach(function (sheetName) {
      let roa = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })
      if (roa.length) result[sheetName] = roa
    })
    return JSON.stringify(result, 2, 2)
  }
  try {
    workbook = xlsx.readFile(req.file.path)

    let result = {}
    workbook.SheetNames.forEach(function (sheetName) {
      let roa = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })
      if (roa.length) result[sheetName] = roa
    })
    let data = result['Sheet1']

    data.forEach(async (employee, idx) => {
      // if (idx === data.length - 1) return

      let newEmployee = {
        startDate: employee[1],
        nik: employee[2],
        last_Name: employee[3],
        first_Name: employee[4],
        birthday: employee[5],
        department: employee[6],
        jam_masuk: employee[7] ? new Date('12-12-2000 ' + employee[7]) : null,
        atasan_langsung: employee[8] }

      console.log(employee)

      await db.Employee.create(newEmployee, function (err, newlyCreated) {
        if (err) {

        } else {
          // redirect back to events page
          console.log('Employee created')
        }
      })
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
