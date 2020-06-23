const amqp = require('amqplib/callback_api');
const { exec } = require("child_process");
const { client } = require('./redis-client')

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
            client.hmset(key, 'urlBW', path.slice(22));
          }
        });
      },
        {
          noAck: true
        });
    });
  });
}

module.exports = { listenToQueue }
