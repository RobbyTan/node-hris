let mongoose = require('mongoose')

let attendanceSchema = new mongoose.Schema({
  date: {
    type: Date
  },
  nik: {
    type: String,
    ref: 'Employee'
  },
  type: {
    type: String,
    enum: ['auto', 'manual']
  }
})

module.exports = mongoose.model('Attendance', attendanceSchema)
