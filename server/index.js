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
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '../videos');
  },
  filename: function(req, file, cb) {
    cb(null, req.body.filename + '.mov');
  },
});
//middleware to upload file to destination using multer
var upload = multer({ storage: storage });

app.post('/', upload.single('video'), (req, res, next) => {
  // console.log(req);
  res.end('Uploaded!');
});

app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client/index.html'));
});

app.listen(port, () => console.log(`Ready to old time it up at port ${port}!`));
