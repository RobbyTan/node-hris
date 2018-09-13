const express = require('express')
const router = express.Router()
const auth = require('../middleware/authentication')

router.get('/', auth.isLoggedIn, (req, res) => {
  res.render('dashboard/dashboard')
})

module.exports = router
