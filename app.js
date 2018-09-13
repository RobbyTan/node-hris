require('dotenv').config()

const path = require('path')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const passport = require('passport')

const apiRoutes = require('./routes/api')
const userRoutes = require('./routes/user')
const dashboardRoutes = require('./routes/dashboard')
const attendanceRoutes = require('./routes/attendance')
const employeeRoutes = require('./routes/employee')
const reportRoutes = require('./routes/report')
const configurationRoutes = require('./routes/configuration')
const payrollRoutes = require('./routes/payroll')

const auth = require('./middleware/authentication.js')

// apply middlewares
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(require('express-session')({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
  res.locals.currentUser = req.user
  res.locals.moment = require('moment')
  next()
})

// surface routes
app.get('/', auth.isLoggedIn, (req, res) => {
  res.redirect('/dashboard')
})
app.use('/user', userRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/attendance', attendanceRoutes)
app.use('/employee', employeeRoutes)
app.use('/api', apiRoutes)
app.use('/report', reportRoutes)
app.use('/configuration', configurationRoutes)
app.use('/payroll', payrollRoutes)
app.get('*', async (req, res) => {
  res.redirect('/')
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log()
  console.log(`App listening on port ${PORT}.`)
  console.log('Press Ctrl+C to quit.')
  console.log()
})
