const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const moment = require('moment')
const { upload } = require('../middleware/upload')
const db = require('../models')
const auth = require('../middleware/authentication.js')
const HEADER_HEIGHT = 3

router.get('/view', auth.reportAccess(), (req, res) => {
  res.render('employee/view')
})

router.get('/new/menu', auth.reportAccess(), (req, res) => {
  res.render('employee/new-menu')
})

router.get('/new/upload', auth.reportAccess(), (req, res) => {
  res.render('employee/new-upload')
})

router.post('/new/upload', auth.reportAccess(), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(404).json({ error: true })
  try {
    // let uploadResult = await cloudinary.v2.uploader.upload(req.file.path, { resource_type: 'raw' })
  } catch (err) {
    console.log('Fail cloudinary upload')
  }
  try {
    let fulldataFields = getFulldataFields()

    let workbook = xlsx.readFile(req.file.path)
    let rows = xlsx.utils.sheet_to_json(workbook.Sheets['Sheet1'], { header: 1 }).slice(HEADER_HEIGHT)

    let invalidInfo = isFulldataExcelInvalid(rows)
    if (invalidInfo) {
      return res.status(404).json({ invalidInfo })
    }

    let newEmployees = rows.map(row => {
      let empObj = {}
      console.log(row)
      row.forEach((cell, idx) => {
        empObj[fulldataFields[idx].name] = fulldataFields[idx].parse(cell)
      })
      return empObj
    })

    let failCounter = 0
    for (let emp of newEmployees) {
      try {
        await db.Fulldata.update({ nik: emp.nik }, emp, { upsert: true })
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

function isFulldataExcelInvalid(rows) {
  let fulldataFields = getFulldataFields()

  let mandatoryColumns = [];
  [1, 2, 53].forEach(idx => {
    if (rows.filter(row => row[idx]).length !== rows.length) {
      mandatoryColumns.push(colExcel(idx))
    }
  })

  let mismatchTypeCell = []
  rows.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      if (!fulldataFields[cellIndex].parse(cell)) {
        mismatchTypeCell.push(`${HEADER_HEIGHT + rowIndex + 1}${colExcel(cellIndex)}`)
      }
    })
  })
  if (mandatoryColumns.length || mismatchTypeCell.length)
    return { mandatoryColumns, mismatchTypeCell }
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

function getFulldataFields () {
  let fieldsMap = db.Fulldata.schema.tree
  fieldsMap['nik'] = 'String'
  delete fieldsMap['id']
  delete fieldsMap['_id']
  delete fieldsMap['__v']
  let fields = []
  for (let name in fieldsMap) {
    let datatype = fieldsMap[name] + ''
    if (datatype.includes('Date')) {
      fields.push({
        name: name,
        parse: function (date) {
          if (moment(date, 'DD-MMM-YYYY', true).isValid()) {
            return moment(date, 'DD-MMM-YYYY').toDate()
          } else return null
        }
      })
    } else if (datatype.includes('String')) {
      fields.push({
        name: name,
        parse: function (string) { return string }
      })
    } else if (datatype.includes('Number')) {
      fields.push({
        name: name,
        parse: function (number) {
          if (number.match(/^[0-9,\.]$/g)) {
            return +number
          } else return null
        }
      })
    }
  }
  return fields
}

module.exports = router
