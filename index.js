const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const methodOverride = require("method-override")

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

app.get('/', (req, res) => {
  res.redirect('/login')
})
app.get('/dashboard', (req, res) => {
  res.render('dashboard')
})
app.get('/login', (req, res) => {
  res.render('login')
})
app.post('/login', (req, res) => {
  res.redirect('/dashboard')
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
