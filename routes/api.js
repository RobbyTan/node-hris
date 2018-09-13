const express = require('express')
const router = express.Router()
const moment = require('moment')
const db = require('../models')

// employee
router.get('/employee', async (req, res) => {
  try {
    let employees = await db.Fulldata.aggregate([
      {
        $project: {
          tanggal_mulai_kerja_medan: 1,
          nik: 1,
          nama_depan: 1,
          nama_belakang: 1,
          tanggal_lahir: 1,
          kategori_pegawai: 1,
          department: 1,
          status_pegawai: 1,
          jam_masuk: 1,
          atasan_langsung: 1
        }
      }
    ])
    res.json(employees)
  } catch (err) {
    console.log(err)
    res.status(404).json({ error: true })
  }
})

// attendance

router.get('/attendance/:nik', (req, res) => {
  let nik = req.params.nik
  let date = req.query.date

  db.Absensi.aggregate([
    {
      $match: {
        $and: [
          { nik: nik },
          { date: { $gte: new Date(date) } },
          { date: { $lt: moment(date, 'YYYY-MM-DD').add(1, 'days').toDate() } }
        ]
      }
    },
    {
      $project: {
        _id: 0,
        date: 1,
        type: 1
      }
    }
  ]).then(data => {
    res.json(data)
  }).catch(err => {
    res.status(404).json({ error: true })
  })
})

router.post('/attendance', (req, res) => {
  let newAttendance = {
    nik: req.headers.nik,
    date: req.headers.timestamp,
    type: 'manual'
  }
  db.Absensi.find({ nik: newAttendance.nik, date: newAttendance.date }, function (attendance) {
    if (attendance) {
      res.status(404).json({ duplicate: true })
    } else {
      db.Absensi.create(newAttendance, (err, newlyCreated) => {
        if (err) return res.status(404).json({ error: true })
        res.json({ success: true })
      })
    }
  })
})

router.get('/attendance/full', async (req, res) => {
  let startString = req.query.startString
  let endString = req.query.endString
  try {
    if (!startString || !endString) throw new Error('from & to not specified')
    res.json(await getFullAttendances(startString, endString))
  } catch (err) {
    res.status(404).json({ error: true })
  }
})

router.get('/attendance', async (req, res) => {
  let startString = req.query.startString
  let endString = req.query.endString
  try {
    if (!startString || !endString) throw new Error('from & to not specified')
    res.json(await getAttendances(startString, endString))
  } catch (err) {
    res.status(404).json({ error: true })
  }
})

async function getAttendances (fromString, toString) {
  let days = Math.abs(moment(fromString, 'YYYY-MM-DD').diff(moment(toString, 'YYYY-MM-DD'), 'days')) + 1
  let fromDate = moment(fromString, 'YYYY-MM-DD')
  let rows = []
  for (let i = 0; i < days; i++) {
    rows = rows.concat(await queryAttendancesAt(fromDate.format('YYYY-MM-DD')))
    fromDate.add(1, 'days')
  }
  return rows
}

async function getFullAttendances (fromString, toString) {
  let days = Math.abs(moment(fromString, 'YYYY-MM-DD').diff(moment(toString, 'YYYY-MM-DD'), 'days')) + 1
  let fromDate = moment(fromString, 'YYYY-MM-DD')
  let rows = []
  for (let i = 0; i < days; i++) {
    rows = rows.concat(await queryFullAttendancesAt(fromDate.format('YYYY-MM-DD')))
    fromDate.add(1, 'days')
  }
  return { rows, date: fromString }
}

function queryFullAttendancesAt (date) {
  return db.Fulldata.aggregate([
    {
      $lookup: {
        'from': 'attendances',
        'localField': 'nik',
        'foreignField': 'nik',
        'as': 'data_absensi'
      }
    },
    {
      $project: {
        tanggal_mulai_kerja_medan: 1,
        nik: 1,
        nama_depan: 1,
        nama_belakang: 1,
        tanggal_lahir: 1,
        kategori_pegawai: 1,
        department: 1,
        status_pegawai: 1,
        jam_masuk: 1,
        atasan_langsung: 1,
        absensi: {
          $filter: {
            input: '$data_absensi',
            as: 'absensi',
            cond: { $and: [{ $gte: ['$$absensi.date', new Date(date)] }, { $lt: ['$$absensi.date', moment(date, 'YYYY-MM-DD').add(1, 'days').toDate()] }] }
          }
        }
      }
    }
  ])
}

function queryAttendancesAt (date) {
  return db.Absensi.aggregate([
    {
      $match: {
        $and: [
          { date: { $gte: moment(date, 'YYYY-MM-DD').toDate() } },
          { date: { $lt: moment(date, 'YYYY-MM-DD').add(1, 'days').toDate() } }
        ]
      }
    },
    {
      $lookup: {
        'from': 'fulldatas',
        'localField': 'nik',
        'foreignField': 'nik',
        'as': 'employee'
      }
    },
    {
      $unwind: '$employee'
    },
    {
      $group: {
        _id: {
          nik: '$nik'
        },
        nik: { $first: '$employee.nik' },
        tanggal_mulai_kerja_medan: { $first: '$employee.tanggal_mulai_kerja_medan' },
        nama_depan: { $first: '$employee.nama_depan' },
        nama_belakang: { $first: '$employee.nama_belakang' },
        tanggal_lahir: { $first: '$employee.tanggal_lahir' },
        kategori_pegawai: { $first: '$employee.kategori_pegawai' },
        department: { $first: '$employee.department' },
        jam_masuk: { $first: '$employee.jam_masuk' },
        atasan_langsung: { $first: '$employee.atasan_langsung' },
        status_pegawai: { $first: '$employee.status_pegawai' },
        absensi: {
          $push: {
            date: '$date',
            nik: '$nik'
          }
        }
      }
    }
  ])
}

// Report routes
router.get('/pph', (req, res) => {
  db.Fulldata.find({}, function (err, allData) {
    if (err) {
      console.log(err)
    } else {
      res.json(allData)
    }
  })
})
router.delete('/pph', (req, res) => {
  let id = req.headers.selected
  db.Fulldata.findByIdAndRemove(id, function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log('Deleted')
      res.send('deleted')
    }
  })
})

router.get('/fulldata', (req, res) => {
  let selectedFieldMap = req.query.selectedFieldMap || {}
  for (let key in selectedFieldMap) selectedFieldMap[key] = 1
  selectedFieldMap['_id'] = 0

  db.Fulldata.aggregate([
    {
      $project: selectedFieldMap
    }
  ], function (err, data) {
    if (err) return res.status(404).json({ errorMsg: err })
    res.json(data)
  })
})

router.get('/employeedata', (req, res) => {
  db.Fulldata.aggregate([
    {
      $project: {
        nik: 1,
        nama_depan: 1,
        nama_belakang: 1,
        kategori_pegawai: 1,
        tanggal_lahir: 1,
        atasan_langsung: 1,
        jam_masuk: 1
      }
    }
  ], function (err, allData) {
    if (err) return console.log(err)
    res.json(allData)
  })
})

let reportDuplicateChecker = function (req, res, next) {
  let excludedId = req.params.id
  let newReport = {
    startDate: new Date(req.headers.startdate),
    endDate: new Date(req.headers.enddate)
  }
  db.PayrollReport.aggregate([
    { $project: {
      month: { $month: '$endDate' },
      year: { $year: '$endDate' }
    } },
    { $match: { $and: [
      { month: +(moment(newReport.endDate).format('M')) },
      { year: +(moment(newReport.endDate).format('YYYY')) }
    ] } }
  ], function (err, returnedData) {
    if (err) { res.status(404).json({ errorMsg: 'aggregate error' }) } else if (returnedData && returnedData.length > 0 && returnedData[0]._id != excludedId) { res.status(404).json({ errorMsg: 'duplicate report on DB' }) } else next()
  })
}

router.post('/payrollreport', reportDuplicateChecker, (req, res) => {
  let newReport = {
    startDate: new Date(req.headers.startdate),
    endDate: new Date(req.headers.enddate)
  }
  db.PayrollReport.create(newReport, function (err, createdReport) {
    if (err) return res.status(404).json({ errorMsg: 'failed to create new report' })
    res.json(createdReport)
  })
})
router.put('/payrollreport/:id', reportDuplicateChecker, (req, res) => {
  db.PayrollReport.findByIdAndUpdate(req.params.id, { $set: {
    startDate: new Date(req.headers.startdate),
    endDate: new Date(req.headers.enddate)
  } }, function (err, updatedReport) {
    if (err) return res.status(404).json({ errorMsg: 'failed to update report' })
    res.json(updatedReport)
  })
})
router.get('/payrollreport/:id/keteranganpayroll', (req, res) => {
  let id = req.params.id
  db.PayrollReport.findById(id).populate('keteranganPayrolls').exec(function (err, payrollReport) {
    if (err) res.status(404).json({ errorMsg: 'failed to fetch keteranganPayroll' })
    else res.json(payrollReport.keteranganPayrolls)
  })
})
router.post('/payrollreport/:id/keteranganpayroll', (req, res) => {
  let newKeterangan = {
    nik: req.headers.nik,
    nominal: +req.headers.nominal,
    keterangan: req.headers.keterangan
  }
  let id = req.params.id
  db.KeteranganPayroll.create(
    newKeterangan
  ).then(function (createdKeterangan) {
    db.PayrollReport.findByIdAndUpdate(
      id,
      { $push: { keteranganPayrolls: createdKeterangan._id } }
    ).then(function (data) {
      res.json(data)
    }).catch(function (err) {
      res.status(404).json({ errorMsg: 'failed to add keteranganPayroll' })
    })
  }).catch(function (err) {
    res.status(404).json({ errorMsg: 'failed to create keteranganPayroll' })
  })
})

router.get('/keteranganpayroll', (req, res) => {
  let nik = req.query.nik ? req.query.nik : /.*/
  let startDate = req.query.startDate
  let endDate = req.query.endDate
  db.KeteranganPayroll.aggregate([
    {
      $match: {
        $and: [
          { nik: nik },
          { startDate: new Date(startDate) },
          { endDate: new Date(endDate) }
        ]
      }
    }
  ]).then(data => {
    res.json(data)
  }).catch(err => {
    res.status(404).json({ error: true })
  })
})
router.post('/keteranganpayroll', (req, res) => {
  let newKeterangan = {
    nik: req.headers.nik,
    startDate: req.headers.startdate,
    endDate: req.headers.enddate,
    nominal: req.headers.nominal,
    keterangan: req.headers.keterangan
  }
  db.KeteranganPayroll.create(newKeterangan, function (err, createdKeterangan) {
    if (err) return res.status(404).json({ error: true })
    res.json({ success: true })
  })
})

router.post('/configuration/DosenMaxTime', (req, res) => {
  let maxTime = req.headers.maxtime
  db.Configuration.update({}, { $set: {
    dosenTidakTetapMaxTime: maxTime
  } }, function (err) {
    if (err) return res.status(404).json({ error: true })
    res.json({ success: true })
  })
})

router.post('/configuration/password', (req, res) => {
  db.Configuration.findOne({}, (err, configuration) => {
    if (err) {
      console.log(err)
    } else {
      res.json(configuration)
    }
  })
})



module.exports = router
