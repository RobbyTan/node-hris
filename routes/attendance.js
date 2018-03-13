const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const { upload } = require('../middleware/upload')
const db = require('../models')
const moment = require('moment')
const authentication = require('../middleware/authentication.js')

// attendance route

router.get('/view',authentication.isLoggedIn,(req, res) => {
  res.render('./attendance/viewAttendance')
})

router.get('/view1',authentication.isLoggedIn, (req, res) => {
  res.render('./attendance/viewAttendance1')
})

router.get('/view2',authentication.isLoggedIn, (req, res) => {
  res.render('./attendance/viewAttendance2')
})

router.get('/view3',authentication.isLoggedIn, (req, res) => {
  res.render('./attendance/viewAttendance3')
})

router.get('/upload',authentication.isLoggedIn, (req, res) => {
  res.render('./attendance/uploadAttendance')
})

router.get('/uploadexcel',authentication.isLoggedIn, (req, res) => {
  res.render('./attendance/uploadAttendanceExcel')
})

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(422).json({
      error: 'Please Upload a file'
    })
  }
  let workbook
  let toJson = function toJson (workbook) {
    let result = {}
    workbook.SheetNames.forEach(function (sheetName) {
      let roa = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1})
      if (roa.length) result[sheetName] = roa
    })
    return JSON.stringify(result, 2, 2)
  }
  try {
    workbook = xlsx.readFile(req.file.path)

    let result = {}
    workbook.SheetNames.forEach(function (sheetName) {
      let roa = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1})
      if (roa.length) result[sheetName] = roa
    })
    let data = result['Sheet1']
    console.log(data)

    data.forEach(async (attendance, idx) => {
      if (idx === 0) return

      let newAttendance = {
        nik: attendance[2],
        date: moment(attendance[0] + attendance[1], 'YYYYMMDDHHmmss').toDate()
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
    // await Event.create(newEvent, function (err, newlyCreated) {
    //   if (err) {
    //     console.log(err)
    //   } else {
    //     // redirect back to events page
    //     console.log('event created')
    //     req.flash('success', 'you created an event')
    //     res.redirect('/admin/events')
    //   }
    // })
  } catch (err) {
    console.log(err)
    return res.status(422).json({
      error: 'Error'
    })
  }
  return res.status(200).send(toJson(workbook))
})

module.exports = router
