
var authentication={};


authentication.isLoggedIn = function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}
authentication.payrollAccess = function payrollAccess(req, res, next) {
	if (req.isAuthenticated() && req.session.payroll 
			&& [process.env.SUPERUSER1, process.env.SUPERUSER2, process.env.SUPERUSER3].includes(req.user._id.toString())) {
		next();
	} else {
		res.redirect("/payroll/access");
	}
}
authentication.reportAccess = function reportAccess(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.redirect("back");
	}
}
authentication.access = function access(req, res, next) {
	if (req.isAuthenticated()&& [process.env.SUPERUSER1, process.env.SUPERUSER2, process.env.SUPERUSER3].includes(req.user._id.toString())) {
		next();
	} else {
		res.redirect("back");
	}
}

module.exports = authentication;
