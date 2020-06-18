const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const multer = require('multer');
const exphbs = require('express-handlebars');

//HANDLEBARS SETUP
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

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

//ROUTES

app.post('/', (req, res, next) => {
  upload(req, res, function(err) {
    //TODO: MUST HANDLE DUPLICATES
    if (err) {
      res.send(err.message);
      return err;
    } else if (!req.file) {
      res.status(422).send('You must upload a file that is a video type.');
    } else {
      res.redirect('/1');
    }
  });
});

const videos = {
  1: { name: 'CUPCAKE', url: '/fakeurl' },
  2: { name: 'IMG_1078' },
};

app.get('/list', (req, res, next) => {
  res.render('list', {
    videos: videos,
  });
});

app.get('/:key', (req, res, next) => {
  //if ready, send url
  if (videos[req.params.key].url) {
    res.render('video', {
      url: '/fakeurl',
    });
  } else {
    //else, send no url
    res.render('video');
  }
});

app.use('*', (req, res) => {
  res.render('home');
});

app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

app.listen(port, () => console.log(`Ready to old time it up at port ${port}!`));
