const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const { upload } = require('../middleware/upload')
const db = require('../models')
const moment = require('moment')
const auth = require('../middleware/authentication')

// attendance route
router.get('/view/menu', auth.isLoggedIn, (req, res) => {
  res.render('attendance/view-menu')
})

router.get('/view/1', auth.isLoggedIn, (req, res) => {
  res.render('attendance/view-1')
})

router.get('/view/2', auth.isLoggedIn, (req, res) => {
  res.render('attendance/view-2')
})

router.get('/new/menu', auth.isLoggedIn, (req, res) => {
  res.render('attendance/new-menu')
})

router.get('/new/upload', auth.isLoggedIn, (req, res) => {
  res.render('./attendance/new-upload')
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
    console.log(data)

    data.forEach(async (attendance, idx) => {
      if (idx === 0) return

      let newAttendance = {
        nik: attendance[2],
        date: moment(attendance[0] + attendance[1], 'YYYYMMDDHHmmss').toDate(),
        type: 'auto'
      }

      await db.Absensi.create(newAttendance, function (err, newlyCreated) {
        if (err) {
          console.log(err)
        } else {
          // redirect back to events page
          console.log('Absensi created')
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
