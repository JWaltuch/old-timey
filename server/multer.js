const multer = require('multer');

// MULTER SETUP: DEFAULT STORAGE AND FILENAME FUNCTIONS
export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/old-timey/videos');
  },
  filename: function (req, file, cb) {
    if (req.body.filename !== '') {
      cb(null, req.body.filename + '.mov');
    } else {
      cb(null, file.originalname);
    }
  },
});
export function fileFilter(req, file, cb) {
  cb(null, file.mimetype === 'video/quicktime');
}