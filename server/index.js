const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const multer = require('multer');
const exphbs = require('express-handlebars');
const redis = require('redis');
const amqp = require('amqplib/callback_api');
const fs = require('fs')
const favicon = require('serve-favicon')
const { v1: uuidv1 } = require('uuid');

//HANDLEBARS SETUP
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//REDIS SETUP
const client = redis.createClient();
client.on('connect', function () {
  console.log('The redis client is connected.');
});

// MIDDLEWARE TO SERVE STATIC FILES
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(favicon(path.join(__dirname, '..', 'favicon.ico')))

// MULTER SETUP: DEFAULT STORAGE AND FILENAME FUNCTIONS
let storage = multer.diskStorage({
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
function fileFilter(req, file, cb) {
  cb(null, file.mimetype === 'video/quicktime');
}
//middleware to upload file to destination using multer
var upload = multer({ storage: storage, fileFilter: fileFilter }).single(
  'video'
);

// RABBITMQ SENDER FUNCTION
function sendToQueue(msg) {
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      let queue = 'video_paths';
      channel.assertQueue(queue, {
        durable: true
      });
      channel.sendToQueue(queue, Buffer.from(msg), {
        persistent: true
      });
      console.log(" [x] Sent '%s'", msg);
    });
    setTimeout(function () {
      connection.close();
    }, 500);
  });
}

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
      sendToQueue(`videos:${id} /${id}`)
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
    try {
      const path = `/var/old-timey/videos/BW/${video.name}`;
      if (fs.existsSync(path)) {
        video["urlBW"] = path;
      }
    } catch (err) {
      return next(err)
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
