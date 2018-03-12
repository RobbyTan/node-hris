let mongoose = require('mongoose')
mongoose.set('debug', true)
// let DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/hrd'
let DATABASE_URL = 'mongodb://localhost/hrd'
mongoose.connect(DATABASE_URL)

mongoose.Promise = Promise
module.exports.Employee = require('./employee')
module.exports.Absensi = require('./attendance')
module.exports.Pph = require('./pph')