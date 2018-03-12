let mongoose = require('mongoose')

let employeeSchema = new mongoose.Schema({
  startDate: Date,
  nik: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    required: true
  },
  last_Name: String,
  first_Name: String,
  birthday: Date,
  department: String,
  jam_masuk: Date,
  atasan_langsung: String,
  absensi: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendance'
    }
  ]
})

let Employee = mongoose.model('Employee', employeeSchema)

module.exports = Employee
