const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const { upload } = require('../middleware/upload')
const db = require('../models')
const moment = require('moment')
const auth = require('../middleware/authentication')
const HEADER_HEIGHT = 3

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
  if (!req.file) return res.status(404).json({ error: true })
  
  try {
    let workbook = xlsx.readFile(req.file.path)
    let rows = xlsx.utils.sheet_to_json(workbook.Sheets['Sheet1'], { header: 1 }).slice(HEADER_HEIGHT)

    let invalidInfo = isAttendanceExcelInvalid(rows)
    if (invalidInfo) {
      return res.status(404).json({ invalidInfo })
    }

    let newAttendances = rows.map(row => {
      return {
        nik: row[2],
        date: moment(row[0] + row[1], 'YYYYMMDDHHmmss').toDate(),
        type: 'auto'
      }
    })

    let failCounter = 0
    for (let att of newAttendances) {
      try {
        await db.Absensi.update({ date: att.date }, att, { upsert: true })
      } catch (err) { 
        console.log(err) 
        failCounter += 1
      }
    }
    return res.json({ success: failCounter === 0, failCounter })
  } catch (err) {
    console.log(err)
    return res.status(404).json({ success: false })
  }
})

function isAttendanceExcelInvalid(rows) {
  let mandatoryColumns = [];
  [0, 1, 2].forEach(idx => {
    if (rows.filter(row => row[idx]).length !== rows.length) {
      mandatoryColumns.push(colExcel(idx))
    }
  })

  let mismatchTypeRows = []
  rows.forEach((row, rowIndex) => {
    if (!moment(row[0] + row[1], 'YYYYMMDDHHmmss', true).isValid()) {
      mismatchTypeRows.push(HEADER_HEIGHT + rowIndex + 1)
    }
  })
  
  if (mandatoryColumns.length || mismatchTypeRows.length)
    return { mandatoryColumns, mismatchTypeRows }
  else return null
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
