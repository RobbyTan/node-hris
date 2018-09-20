const querystring = require('querystring')

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect('/user/login')
}

function reportAccess (dontDirectToAccess) {
  return function (req, res, next) {
    if (!req.isAuthenticated()) {
      res.redirect(`/user/login`)
    } else if (!dontDirectToAccess && !req.session.reportUserId) {
      const queryString = querystring.stringify({ continueUrl: req.originalUrl })
      res.redirect('/report/access?' + queryString)
    } else {
      next()
    }
  }
}

function payrollAccessOther (dontDirectToAccess) {
  return function (req, res, next) {
    const grantedUserIDs = [process.env.SUPERUSER1, process.env.SUPERUSER2, process.env.SUPERUSER3]
    if (!req.isAuthenticated()) {
      res.redirect(`/user/login`)
    } else if (!grantedUserIDs.includes(req.user._id.toString())) {
      res.redirect('back')
    } else if (!dontDirectToAccess && !grantedUserIDs.includes(req.session.otherPayrollUserId || '')) {
      const queryString = querystring.stringify({ continueUrl: req.originalUrl })
      res.render('./partials/accessView', {
        title: 'Other Payroll',
        postUrl: '/payroll/access-other?' + queryString
      })
    } else {
      next()
    }
  }
}

function payrollAccessMonthly (dontDirectToAccess) {
  return function (req, res, next) {
    const grantedUserIDs = [process.env.SUPERUSER1, process.env.SUPERUSER2, process.env.SUPERUSER3]
    if (!req.isAuthenticated()) {
      res.redirect(`/user/login`)
    } else if (!grantedUserIDs.includes(req.user._id.toString())) {
      res.redirect('back')
    } else if (!dontDirectToAccess && !grantedUserIDs.includes(req.session.monthlyPayrollUserId || '')) {
      const queryString = querystring.stringify({ continueUrl: req.originalUrl })
      res.render('./partials/accessView', {
        title: 'Monthly Payroll',
        postUrl: '/payroll/access-monthly?' + queryString
      })
    } else {
      next()
    }
  }
}

function blocked (blocked) {
  return (req, res, next) => {
    if (blocked) return res.redirect('back')
    else next()
  }
}

module.exports = {
  isLoggedIn,
  reportAccess,
  payrollAccessOther,
  payrollAccessMonthly,
  blocked
}
