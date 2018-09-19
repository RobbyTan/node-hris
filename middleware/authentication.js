const querystring = require('querystring')
let authentication = {}

function isLoggedIn (req, res, next) {
  return next()
  if (req.isAuthenticated()) return next()
  res.redirect('/user/login')
}

function reportAccess (dontDirectToAccess) {
  return function (req, res, next) {
    return next()
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

function payrollAccess (dontDirectToAccess) {
  return function (req, res, next) {
    return next()
    const grantedUserIDs = [process.env.SUPERUSER1, process.env.SUPERUSER2, process.env.SUPERUSER3]
    if (!req.isAuthenticated()) {
      res.redirect(`/user/login`)
    } else if (!grantedUserIDs.includes(req.user._id.toString())) {
      res.redirect('back')
    } else if (!dontDirectToAccess && !grantedUserIDs.includes(req.session.payrollUserId || '')) {
      const queryString = querystring.stringify({ continueUrl: req.originalUrl })
      res.redirect('/payroll/access?' + queryString)
    } else {
      next()
    }
  }
}

function payrollAccessUploadMonthly (dontDirectToAccess) {
  return function (req, res, next) {
    return next()
    const grantedUserIDs = [process.env.SUPERUSER1, process.env.SUPERUSER2, process.env.SUPERUSER3]
    if (!req.isAuthenticated()) {
      res.redirect(`/user/login`)
    } else if (!grantedUserIDs.includes(req.user._id.toString())) {
      res.redirect('back')
    } else if (!dontDirectToAccess && !grantedUserIDs.includes(req.session.payrollUserId || '')) {
      const queryString = querystring.stringify({ continueUrl: req.originalUrl })
      res.redirect('/payroll/access?' + queryString)
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
  payrollAccess,
  payrollAccessUploadMonthly,
  blocked
}
