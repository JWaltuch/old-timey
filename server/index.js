const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
var multer = require('multer');

// POST: uploads the file and redirects to /:key
// /:key
// :key is a generated UUID
// This page shows the message “Video is still processing” or “Here’s a download link” that lets the user download the file directly from nginx.
// /list
// GET: show all uploaded content. Mostly for debugging.

// static file-serving middleware
app.use(express.static(path.join(__dirname, '..', 'public')));

//setup storage and filename multer will use
let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '../videos');
  },
  filename: function(req, file, cb) {
    console.log(file);
    if (req.body.filename !== '') {
      cb(null, req.body.filename + '.mov');
    } else {
      cb(null, file.originalname + '.mov');
    }
  },
});
function fileFilter(req, file, cb) {
  cb(null, file.mimetype === 'video/quicktime');
}
//middleware to upload file to destination using multer
var upload = multer({ storage: storage, fileFilter: fileFilter });

app.post('/', upload.single('video'), (req, res, next) => {
  //HANDLES ERRORS IF USER UPLOADS NO FILE
  //HANDLE ERRORS IF USER UPLOADS WRONG TYPE OF FILE
  // let extension = path.extname(req.file.originalname).toLowerCase();
  // if (extension !== '.mov') {
  //   throw new Error('Cannot accept files that are not .mov');
  // } else {
  //   res.end('Uploaded!');
  // }
  res.end('Uploaded!');
});

app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client/index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

app.listen(port, () => console.log(`Ready to old time it up at port ${port}!`));
