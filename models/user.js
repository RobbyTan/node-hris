let mongoose = require('mongoose')
let passportLocalMongoose = require('passport-local-mongoose')

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: String
})
userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)
