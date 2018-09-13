let mongoose = require('mongoose')
let DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/hrd'

mongoose.Promise = Promise
mongoose.set('debug', true)
mongoose.connect(DATABASE_URL)

module.exports.User = require('./user')
module.exports.Absensi = require('./attendance')
module.exports.Fulldata = require('./fulldata')
module.exports.KeteranganPayroll = require('./keterangan-payroll.js')
module.exports.Configuration = require('./configuration')
module.exports.PayrollReport = require('./payroll-report.js')
