let mongoose = require('mongoose');

let payrollReportSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
  keteranganPayrolls: [{type: mongoose.Schema.Types.ObjectId, ref: 'KeteranganPayroll'}]
});

let PayrollReport = mongoose.model('PayrollReport', payrollReportSchema);

module.exports = PayrollReport;
