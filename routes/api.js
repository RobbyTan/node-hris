const express = require('express')
const router = express.Router()
const db = require('../models')
const moment = require('moment')
const methodOverride = require("method-override")

router.use(methodOverride("_method"));
// attendance route

router.get('/attendancesfull', async(req, res) => {
  let from = req.query.from
  let to = req.query.to

  if (from && to) {
    res.json(await getFullAttendancesJSON(from, to))
  } else {
    res.json({})
  }
})

router.get('/attendances', async(req, res) => {
  let from = req.query.from
  let to = req.query.to

  if (from && to) {
    res.json(await getAttendancesJSON(from, to))
  } else {
    res.json({})
  }
})
// PPH routes

router.get('/pph',(req,res)=>{
  db.Fulldata.find({}, function (err, allData) {
    if (err) {
      console.log(err)
    } else {
      res.json(allData);
    }
  })
})

router.delete('/pph',(req,res)=>{
  let id = req.headers.selected;
  db.Fulldata.findByIdAndRemove(id,function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Deleted")
      res.send("deleted")
    }
  })
})

router.get('/employeedata',(req,res)=>{
  db.Fulldata.aggregate([
    {
      $project: {
        nik: 1,
        nama_depan: 1,
        nama_belakang: 1,
        kategori_pegawai: 1,
        atasan_langsung: 1,
        jam_masuk: 1
      }
    }
  ], function (err, allData) {
      if (err) return console.log(err);
      res.json(allData);
  });
})

router.post("/payrollreport", (req, res) => {
  let newReport = {
    startDate: req.headers.startdate,
    endDate: req.headers.enddate
  };
  db.PayrollReport.create(newReport, function (err, createdReport) {
    if (err) return res.status(404).json({errorMsg: 'failed to create new report'});
    res.json(createdReport);
  });
})

router.post("/payrollreport/check", (req, res) => {
  let newReport = {
    startDate: req.headers.startdate,
    endDate: req.headers.enddate
  };
  db.PayrollReport.aggregate([
    { $project: { 
      month: { $month: "$endDate" },
      year: { $year: "$endDate" }
    }},
    { $match: { $and: [
      {month: +(moment(new Date(newReport.endDate)).format('M'))},
      {year: +(moment(new Date(newReport.endDate)).format('YYYY'))}
    ]}}
  ], function(err, returnedData) {
    if (err || (returnedData && returnedData.length > 0)) 
      res.status(404).json({errorMsg: 'error / duplicate report on DB'});
    else res.json({success: true});
  });
})

router.get('/keteranganpayroll', (req, res) => {
  let nik = req.query.nik ? req.query.nik : /.*/;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  db.KeteranganPayroll.aggregate([
    {
      $match: {
        $and: [
          {nik: nik},
          {startDate: new Date(startDate)},
          {endDate: new Date(endDate)}
        ]
      }
    }
  ]).then(data => {
    console.log(data);
    res.json(data);
  }).catch(err => {
    res.status(404).json({error: true});
  });
});

router.post("/keteranganpayroll",(req,res)=>{
  let newKeterangan = {
    nik: req.headers.nik,
    startDate: req.headers.startdate,
    endDate: req.headers.enddate,
    nominal: req.headers.nominal,
    keterangan: req.headers.keterangan
  };
  db.KeteranganPayroll.create(newKeterangan, function (err, createdKeterangan) {
    if (err) return res.status(404).json({error: true});
    res.json({success: true});
  });
})

router.post("/configuration/DosenMaxTime",(req,res)=>{
  let maxTime = req.headers.maxtime;
  db.Configuration.update({}, { $set: {
    dosenTidakTetapMaxTime: maxTime
  }}, function (err) {
    if (err) return res.status(404).json({error: true});
    res.json({success: true});
  });
})

router.post('/configuration/password',(req,res)=>{
  db.Configuration.findOne({}, (err, configuration) => {
    if (err) {
      console.log(err)
    } else {
      res.json(configuration);
    }
  })
})

router.get('/attendances/:nik', (req, res) => {
  let nik = req.params.nik;
  let date = req.query.date;

  db.Absensi.aggregate([
  {
    $match: {
      $and: [
      {nik: nik},
      {date: {$gte: new Date(date)} },
      {date: {$lt: moment(date, 'YYYY-MM-DD').add(1, 'days').toDate()} }
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
    console.log('api', data);
    res.json(data);
  }).catch(err => {
    res.status(404).json({error: true});
  });
});

router.post("/attendances", (req, res) => {
  let newAttendance = {
    nik: req.headers.nik,
    date: req.headers.timestamp,
    type: "manual"
  };
  db.Absensi.find({nik: newAttendance.nik, date: newAttendance.date}, function(attendance) {
    if (attendance) {
      res.status(404).json({duplicate: true});
    } else {
      db.Absensi.create(newAttendance, (err, newlyCreated) => {
        if (err) return res.status(404).json({error: true});
        res.json({success: true});
      });
    }
  });
})

// String, String
async function getAttendancesJSON (fromString, toString) {
  let days = Math.abs(moment(fromString, 'YYYY-MM-DD').diff(moment(toString, 'YYYY-MM-DD'), 'days')) + 1;
  let fromDate = moment(fromString, 'YYYY-MM-DD');
  let dataPromise = [];
  for (let i = 0; i < days; i++) {
    let currentString = fromDate.format('YYYY-MM-DD');
    dataPromise.push(loadResultFromDatabase(currentString));
    fromDate.add(1, 'days');
  }
  let databaseResult = await Promise.all(dataPromise);
  return concatArray(databaseResult);
}

async function getFullAttendancesJSON (fromString, toString) {
  let days = Math.abs(moment(fromString, 'YYYY-MM-DD').diff(moment(toString, 'YYYY-MM-DD'), 'days')) + 1;
  let fromDate = moment(fromString, 'YYYY-MM-DD');
  let dataPromise = [];
  for (let i = 0; i < days; i++) {
    let currentString = fromDate.year() + '-' + (fromDate.month() + 1) + '-' + fromDate.date();
    dataPromise.push(loadResultFromDatabaseFull(currentString));
    fromDate.add(1, 'days');
  }
  let results = await Promise.all(dataPromise);
  return {data: concatArray(results), date: fromString};
}

function concatArray (arr) {
  if (arr.length === 1) { return arr[0] } else {
    return arr.reduce((acc, next) => acc.concat(next), [])
  }
}

function loadResultFromDatabaseFull (date) {
  return db.Fulldata.aggregate([
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
      tanggal_mulai_kerja_medan: 1,
      nik: 1,
      nama_depan: 1,
      nama_belakang: 1,
      tanggal_lahir: 1,
      kategori_pegawai: 1,
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
  ]);
}

function loadResultFromDatabase (date) {
  return db.Absensi.aggregate([
    {
      $match: {
        $and: [
          {date: { $gte: moment(date, 'YYYY-MM-DD').toDate() } },
          {date: { $lt: moment(date, 'YYYY-MM-DD').add(1, 'days').toDate() } }
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
      $unwind: "$employee"
    },
    {
      $group: {
        _id: {
          nik: "$nik"
        },
        startDate: {$first: "$employee.tanggal_mulai_kerja_medan"},
        nik: {$first: "$employee.nik"},
        first_Name: {$first: "$employee.nama_depan"},
        last_Name: {$first: "$employee.nama_belakang"},
        birthday: {$first: "$employee.tanggal_lahir"},
        department: {$first: "$employee.kategori_pegawai"},
        jam_masuk: {$first: "$employee.jam_masuk"},
        atasan_langsung: {$first: "$employee.atasan_langsung"},
        absensi: {
          $push: {
            date: "$date",
            nik: "$nik"
          } 
        }
      }
    }
  ])
}

module.exports = router
