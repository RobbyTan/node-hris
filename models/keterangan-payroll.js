let mongoose = require('mongoose')

let keteranganPayrollSchema = new mongoose.Schema({
  nik: String,
  startDate: Date,
  endDate: Date,
  nominal: Number,
  keterangan: String
})

let KeteranganPayroll = mongoose.model('KeteranganPayroll', keteranganPayrollSchema)

module.exports = KeteranganPayroll
