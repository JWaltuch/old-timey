const amqp = require('amqplib/callback_api');
const { exec } = require("child_process");
const { client } = require('./redis-client')
const fs = require('fs')

function listenToQueue() {
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      const queue = 'video_paths';

      channel.assertQueue(queue, {
        durable: true
      });

      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

      channel.consume(queue, function (msg) {
        console.log(" [x] Received %s", msg.content.toString());
        const [key, path] = msg.content.toString().split(" ")
        try {
          const name = path.slice(22, -4);
          const existingPath = `/var/old-timey/videos/BW/${name}_BW.mov`;
          if (fs.existsSync(existingPath)) {
            client.hmset(key, 'urlBW', name);
          } else {
            exec(`bash ~/old-timey/convert.bash ${path}`, (error, stdout, stderr) => {
              if (error) {
                console.log(`error: ${error.message}`);
                return;
              }
              if (stderr) {
                console.log(`stderror: ${stderr}`);
                return;
              }
            }).on('exit', code => {
              if (code === 0) {
                client.hmset(key, 'urlBW', name);
              }
            });
          }
        } catch (err) {
          return next(err)
        }
      },
        {
          noAck: true
        });
    });
  });
}

module.exports = { listenToQueue }
