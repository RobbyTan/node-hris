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

const upload = multer({ storage: storage, fileFilter: excelFilter })

module.exports = {
  upload
}
