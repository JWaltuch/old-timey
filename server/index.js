const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const multer = require('multer');
const exphbs = require('express-handlebars');
const redis = require('redis');
import { v1 as uuidv1 } from 'uuid';

//HANDLEBARS SETUP
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//REDIS SETUP
const client = redis.createClient();
client.on('connect', function() {
  console.log('The redis client is connected.');
});

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
    if (err) {
      res.send(err.message);
      return err;
    } else if (!req.file) {
      res.render('media-error');
    } else {
      let id = uuidv1();
      while (client.exists(id)) {
        id = uuidv1();
      }
      client.hmset(`videos:${id}`, {
        name: req.file.filename,
        path: `/${id}`,
      });
      res.redirect(`/${id}`);
    }
  });
});

const videos = {
  1: { name: 'CUPCAKE', url: '/fakeurl' },
  2: { name: 'IMG_1078' },
};

app.get('/list', (req, res, next) => {
  let allVids = client.hgetall('videos');
  console.log(allVids);
  res.render('list', {
    videos: videos,
  });
});

app.get('/:key', (req, res, next) => {
  const video = videos[req.params.key];
  res.render('video', video);
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
