let mongoose = require('mongoose')

let configurationSchema = new mongoose.Schema({
  dosenTidakTetapMaxTime: String,
  password: String,
  payrollPasswordOther: String,
  payrollPasswordMonthly: String
})

let Configuration = mongoose.model('Configuration', configurationSchema)

module.exports = Configuration
