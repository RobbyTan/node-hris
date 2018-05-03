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
  console.log(id)
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
  db.Employee.find({}, function (err, allData) {
    if (err) {
      console.log(err)
    } else {
      res.json(allData);
    }
  })
})

router.post("/configuration/DosenMaxTime",(req,res)=>{
  let maxTime = req.headers.maxtime;
  db.Configuration.update({}, { $set: {
    dosenTidakTetapMaxTime: maxTime
  }}, function (err) {
    if (err) console.log(err);
    res.send("success updating DosenMaxTime")
  });
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
  db.Absensi.find({date: newAttendance.date}, function(attendance) {
    if (attendance) res.status(404).json({duplicateError: true});
  });
  db.Absensi.create(newAttendance, (err, newlyCreated) => {
    if (err) return res.status(404).send("error occured");
    res.send("new attendance inserted");
  });
})

// String,String,Boolean
async function showData (from, to, full) {
  let fromString = from;
  let toString = to;

  return await full ? loadResultFromDatabaseFull(fromString) : loadResultFromDatabase(fromString, toString);
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

function loadResultFromDatabase (fromDateStr, toDateStr) {
  return db.Absensi.aggregate([
    {
      $match: {
        date : {
          $gte: new Date(fromDateStr), 
          $lt: moment(toDateStr, 'YYYY-MM-DD').add(1, 'days').toDate()
        }
      }
    },
    {
      $lookup: {
        'from': 'employees',
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
          month: { $month: "$date" }, 
          day: { $dayOfMonth: "$date" }, 
          year: { $year: "$date" },
          nik: "$nik"
        },
        startDate: {$first: "$employee.startDate"},
        nik: {$first: "$employee.nik"},
        first_Name: {$first: "$employee.first_Name"},
        last_Name: {$first: "$employee.last_Name"},
        birthday: {$first: "$employee.birthday"},
        department: {$first: "$employee.department"},
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
