const amqp = require('amqplib/callback_api');

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

module.exports = { sendToQueue }
