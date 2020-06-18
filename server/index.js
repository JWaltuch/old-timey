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
    cb(null, '/var/old-timey/videos');
  },
  filename: function(req, file, cb) {
    if (req.body.filename !== '') {
      cb(null, req.body.filename + '.mov');
    } else {
      cb(null, file.originalname);
    }
  },
});
function fileFilter(req, file, cb) {
  cb(null, file.mimetype === 'video/quicktime');
}
//middleware to upload file to destination using multer
var upload = multer({ storage: storage, fileFilter: fileFilter }).single(
  'video'
);

app.post('/', (req, res, next) => {
  upload(req, res, function(err) {
    //TODO: MUST HANDLE DUPLICATES
    if (err) {
      res.send(err.message);
      return err;
    } else if (!req.file) {
      res.status(422).send('You must upload a file that is a video type.');
    } else {
      res.end('Uploaded!');
    }
  });
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
