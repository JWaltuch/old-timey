const express = require('express');
const path = require('path');
const multer = require('multer');
const exphbs = require('express-handlebars');
const fs = require('fs')
const favicon = require('serve-favicon')
const { v1: uuidv1 } = require('uuid');

const { sendToQueue } = require('./producer')
const { listenToQueue } = require('./consumer')
const { storage, fileFilter } = require('./multer')
const { client } = require('./redis-client')

const app = express();
const port = 3000;

//HANDLEBARS SETUP
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//MIDDLEWARE TO SERVE STATIC FILES
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(favicon(path.join(__dirname, '..', 'favicon.ico')))

//MIDDLEWARE TO DEFINE PARAMETERS FOR MULTER UPLOAD
const upload = multer({ storage: storage, fileFilter: fileFilter }).single(
  'video'
);

//SET UP CONSUMER TO LISTEN TO QUEUE
listenToQueue();

//ROUTES

app.post('/', (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      res.send(err.message);
      return err;
    } else if (!req.file) {
      res.render('media-error');
    } else {
      let id = uuidv1();
      while (client.exists(`videos:${id}`) === 1) {
        id = uuidv1();
      }
      client.hmset(`videos:${id}`, 'name', req.file.filename, 'url', `/${id}`);
      sendToQueue(`videos:${id} /var/old-timey/videos/${req.file.filename}`)
      res.redirect(`/${id}`);
    }
  });
});

app.get('/list', (req, res, next) => {
  client.keys('video*', function (err, resp) {
    if (err) {
      return next(err);
    }
    let allKeys = resp;
    let videos = {}
    allKeys.forEach(key => {
      client.hgetall(key, function (err, resp) {
        if (err) {
          return next(err);
        } else {
          videos[key] = resp;
        }
      });
    });
    return res.render('list', {
      videos
    });
  });
});

app.get('/:key', (req, res, next) => {
  let video = {}
  client.hgetall(`videos:${req.params.key}`, function (err, response) {
    if (err) {
      return next(err);
    } else if (response === null) {
      return res.render('page-not-found');
    }
    video = response;
    vidPrefix = video.name.slice(0, -4);
    if (video.urlBW !== undefined) {
      video.urlBW = `http://192.168.0.105/videos/BW/${vidPrefix}_BW.mov`
    }
    res.render('video', video);
  });
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
