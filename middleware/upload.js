const multer = require('multer')

const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname)
  }
})

const excelFilter = function (req, file, cb) {
  // accept excel files only
  if (!file.originalname.match(/\.(xlsx)$/i)) {
    return cb(new Error('Only excel files are allowed!'), false)
  }
  cb(null, true)
}

const upload = multer({
  storage: storage,
  fileFilter: excelFilter
})

const cloudinary = require('cloudinary')
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

module.exports = {
  upload
}