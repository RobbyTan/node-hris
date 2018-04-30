
var authentication={};


authentication.isLoggedIn = function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}
authentication.payrollAccess = function payrollAccess(req,res,next){
	if(req.isAuthenticated() && (req.user._id.equals(process.env.SUPERUSER1))){
		next();
	}else{
		res.redirect("back");
	}
}

module.exports = authentication;
