const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const methodOverride = require("method-override")
const passport  = require("passport")
const LocalStrategy  = require("passport-local")
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/user");
const authentication = require('./middleware/authentication.js')

const attendanceRoutes = require('./routes/attendance')
const employeeRoutes = require('./routes/employee')
const apiRoutes = require('./routes/api')
const reportRoutes = require('./routes/report')

// apply middleware
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '/public')))
app.use(methodOverride("_method"));
app.locals.moment = require('moment')
// PASSPORT MIDDLEWARE
app.use(require("express-session")({
	secret : "UPH Medan",
	resave : false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	next();
	// untuk memberikan akses current User ke semua
})

app.get('/', (req, res) => {
  res.redirect('/login')
})
app.get('/dashboard',authentication.isLoggedIn, (req, res) => {
  res.render('dashboard')
})
app.get('/login', (req, res) => {
  res.render('login')
})
app.post("/register",function(req,res){
		var newUser = new User({username:req.body.username});
		console.log(newUser)
		User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/dashboard");
		});
	});
})
app.post("/login",passport.authenticate("local",{
	successRedirect : "/dashboard",
	failureRedirect : "/login"
}),function(req,res){

})
app.use('/attendance', attendanceRoutes)
app.use('/employee', employeeRoutes)
app.use('/api', apiRoutes)
app.use('/report', reportRoutes)

// port config
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
  console.log('Press Ctrl+C to quit.')
})
