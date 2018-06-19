let mongoose = require('mongoose');

let payrollReportSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date
});

let PayrollReport = mongoose.model('PayrollReport', payrollReportSchema);

module.exports = PayrollReport;
