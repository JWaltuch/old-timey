const multer = require('multer');
const fs = require('fs')

// MULTER SETUP: DEFAULT STORAGE AND FILENAME FUNCTIONS
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/old-timey/videos');
  },
  filename: function (req, file, cb) {
    console.log("req", req)
    console.log("file", file)
    if (req.body.filename !== '') {
      try {
        const path = `/var/old-timey/videos/${req.body.filename}.mov`;
        if (fs.existsSync(path)) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
          cb(null, `${req.body.filename}_${uniqueSuffix}.mov`);
        } else {
          cb(null, req.body.filename + '.mov');
        }
      } catch (err) {
        return next(err)
      }
    } else {
      try {
        const path = `/var/old-timey/videos/${file.originalname}.mov`;
        if (fs.existsSync(path)) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
          cb(null, `${file.originalname}_${uniqueSuffix}.mov`);
        } else {
          cb(null, file.originalname);
        }
      } catch (err) {
        return next(err)
      }
    }
  },
});
function fileFilter(req, file, cb) {
  cb(null, file.mimetype === 'video/quicktime');
}

module.exports = { storage, fileFilter }
