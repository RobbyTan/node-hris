const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const moment = require('moment')
const { upload } = require('../middleware/upload')
const db = require('../models')
const auth = require('../middleware/authentication.js')
const cloudinary = require('cloudinary')

router.get('/view', auth.isLoggedIn, (req, res) => {
  res.render('employee/view')
})

router.get('/new/menu', auth.isLoggedIn, (req, res) => {
  res.render('employee/new-menu')
})

router.get('/new/upload', auth.isLoggedIn, (req, res) => {
  res.render('employee/new-upload')
})

router.post('/new/upload', auth.isLoggedIn, upload.single('file'), async (req, res) => {  
  if (!req.file) return res.status(404).json({ error: true })
  try {
    // let uploadResult = await cloudinary.v2.uploader.upload(req.file.path, { resource_type: 'raw' })
  } catch (err) {
    console.log('Fail cloudinary upload')
  }
  try {
    let fulldataFields = getFulldataFields()

    let workbook = xlsx.readFile(req.file.path)
    let rows = xlsx.utils.sheet_to_json(workbook.Sheets['Sheet1'], { header: 1 }).slice(3)

    let invalidInfo = isFulldataExcelInvalid(rows)
    if (invalidInfo) {
      return res.status(404).json({ invalidInfo })
    }

    let newEmployees = rows.map(row => {
      let empObj = {}
      row.forEach((cell, idx) => {
        empObj[fulldataFields[idx].name] = fulldataFields[idx].parse(cell)
      })
      return empObj
    })
    let createdEmployees = await db.Fulldata.create(newEmployees)
    return res.json(createdEmployees)
  } catch (err) {
    console.log(err)
    return res.status(404).json({ error: true })
  }
})

function isFulldataExcelInvalid(rows) {
  let fulldataFields = getFulldataFields()

  let mandatoryColumns = [];
  [1, 2, 53].forEach(idx => {
    if (rows.filter(row => row[idx]).length != rows.length) {
      mandatoryColumns.push(colExcel(idx))
    }
  })

  let mismatchTypeCell = []
  let newEmployees = rows.map((row, rowIndex) => {
    let empObj = {}
    row.forEach((cell, cellIndex) => {
      if (!fulldataFields[cellIndex].parse(cell)) {
        mismatchTypeCell.push(`${rowIndex+1}${colExcel(cellIndex)}`)
      }
    })
    return empObj
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
          if (moment(date, 'D-MMM-YYYY', true).isValid()) {
            return moment(date, 'D-MMM-YYYY').toDate()
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
