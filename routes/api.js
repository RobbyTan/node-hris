const express = require('express')
const router = express.Router()
const db = require('../models')
const moment = require('moment')

// attendance route

router.get('/attendancesfull', async(req, res) => {
  let from = req.query.from
  let to = req.query.to
  console.log('true')

  if (from && to) {
    console.log('here')
    res.json(await showData(from, to, true))
  } else {
    res.json({})
  }
})

router.get('/attendances', async(req, res) => {
  let from = req.query.from
  let to = req.query.to
  console.log('false ')

  if (from && to) {
    res.json(await showData(from, to, false))
  } else {
    res.json({})
  }
})

router.get('/pph',(req,res)=>{
    db.Pph.find({}, function (err, allData) {
    if (err) {
      console.log(err)
    } else {
        res.json(allData);
    }
  })
})

router.get('/employeedata',(req,res)=>{
    db.Employee.find({}, function (err, allData) {
    if (err) {
      console.log(err)
    } else {
        res.json(allData);
    }
  })
})
// String,String,Boolean
async function showData (from, to, full) {
  let days = Math.abs(moment(from, 'YYYY-MM-DD').diff(moment(to, 'YYYY-MM-DD'), 'days')) + 1
  let fromDate = moment(from, 'YYYY-MM-DD')
  let dataPromise = []
  for (let i = 0; i < days; i++) {
    let fromString = fromDate.year() + '-' + (fromDate.month() + 1) + '-' + fromDate.date()
    dataPromise.push(full ? loadResultFromDatabaseFull(fromString) : loadResultFromDatabase(fromString))
    fromDate.add(1, 'days')
  }
  let results = await Promise.all(dataPromise)
  return {data: concatArray(results), date: from}
}

function concatArray (arr) {
  if (arr.length === 1) { return arr[0] } else {
    return arr.reduce((acc, next) => acc.concat(next), [])
  }
}

function loadResultFromDatabaseFull (date) {
  return db.Employee.aggregate([
    {
      $lookup:
      {
        'from': 'attendances',
        'localField': 'nik',
        'foreignField': 'nik',
        'as': 'data_absensi'
      }
    },
    {
      $project: {
        startDate: 1,
        nik: 1,
        first_Name: 1,
        last_Name: 1,
        birthday: 1,
        department: 1,
        jam_masuk: 1,
        atasan_langsung: 1,
        absensi: {
          $filter: {
            input: '$data_absensi',
            as: 'absensi',
            cond: {$and: [{$gte: ['$$absensi.date', new Date(date)]}, {$lt: ['$$absensi.date', moment(date, 'YYYY-MM-DD').add(1, 'days').toDate()]}]}
          }
        }
      }
    },
    {
      $match: {
        'department': {$nin: ['Resign', null]}
      }
    }
  ])
}

function loadResultFromDatabase (date) {
  return db.Employee.aggregate([
    {
      $lookup:
      {
        'from': 'attendances',
        'localField': 'nik',
        'foreignField': 'nik',
        'as': 'data_absensi'
      }
    },
    {
      $project: {
        startDate: 1,
        nik: 1,
        first_Name: 1,
        last_Name: 1,
        birthday: 1,
        department: 1,
        jam_masuk: 1,
        atasan_langsung: 1,
        absensi: {
          $filter: {
            input: '$data_absensi',
            as: 'absensi',
            cond: {$and: [{$gte: ['$$absensi.date', new Date(date)]}, {$lt: ['$$absensi.date', moment(date, 'YYYY-MM-DD').add(1, 'days').toDate()]}]}
          }
        }
      }
    },
    {
      $match: {
        'absensi': {$elemMatch: {$ne: null}}
      }
    }
  ])
}

module.exports = router
