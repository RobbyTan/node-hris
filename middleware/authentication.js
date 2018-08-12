const querystring = require('querystring'); 
let authentication = {};

authentication.isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

authentication.reportAccess = function(dontDirectToAccess) {
	return function(req, res, next) {
		if (!req.isAuthenticated()) {
			res.redirect(`/login`);
		} else if (!dontDirectToAccess && !req.session.reportUserId) {
			const queryString = querystring.stringify({continueUrl: req.originalUrl});
			res.redirect('/report/access?'+queryString);
		} else {
			next();
		}
	};
}

authentication.payrollAccess = function(dontDirectToAccess) {
	return function(req, res, next) {
		const grantedUserIDs = [process.env.SUPERUSER1, process.env.SUPERUSER2, process.env.SUPERUSER3];
		if (!req.isAuthenticated()) {
			res.redirect(`/login`);
		} else if (!grantedUserIDs.includes(req.user._id.toString())) {
			res.redirect('back');
		} else if (!dontDirectToAccess && !grantedUserIDs.includes(req.session.payrollUserId || '')) {
			const queryString = querystring.stringify({continueUrl: req.originalUrl});
			res.redirect('/payroll/access?'+queryString);
		} else {
			next();
		}
	};
}

module.exports = authentication;
