let express = require('express')
let router = express.Router()
let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy

let auth = require('../middleware/authentication')
let db = require('../models')

passport.use(new LocalStrategy(db.User.authenticate()))
passport.serializeUser(db.User.serializeUser())
passport.deserializeUser(db.User.deserializeUser())

router.get('/login', (req, res) => {
  res.render('user/login')
})
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/user/login'
}), (req, res) => {})

router.get('/register', auth.blocked(false), (req, res) => {
  res.render('user/register')
})
router.post('/register', auth.blocked(false), function (req, res) {
  let newUser = new db.User({ username: req.body.username })
  db.User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.log(err)
      return res.redirect('back')
    }
    passport.authenticate('local')(req, res, function () {
      res.redirect('/')
    })
  })
})

router.get('/logout', function (req, res) {
  req.logout()
  req.session.destroy()
  res.redirect('/user/login')
})

module.exports = router
