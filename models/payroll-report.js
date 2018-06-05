let mongoose = require('mongoose');

let payrollReportSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
  keterangan: String
});

let PayrollReport = mongoose.model('PayrollReport', payrollReportSchema);

module.exports = PayrollReport;
