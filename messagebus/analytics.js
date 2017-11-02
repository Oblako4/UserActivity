const AWS = require('aws-sdk');
const Consumer = require('sqs-consumer');
const queueConfig = require('../messagebus/config/config.js');
const queues = queueConfig.queues;
const db = require('../database/index.js');

AWS.config.loadFromPath(__dirname + '/../messagebus/config/analyticsconfig.json');
var sqs = new AWS.SQS( {apiVersion: '2012-11-05'} );

var sendMessage = (data, queue) => {
  console.log('New user information message:', data);
  var params = {
    DelaySeconds: 10,
    MessageAttributes: {},
    MessageBody: JSON.stringify(data),
    QueueUrl: queues[queue]
  };
  return new Promise((resolve, reject) => {
    sqs.sendMessage(params, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

var handleMessage = (message, callback) => {
  var body = JSON.parse(message.Body);
  var userId = body.userId;
  var days = body.days;
  db.getLogins(userId, days)
    .then((result) => {
      sendMessage(result, 'analyticsResponses');
    })
    .then((result) => {
      callback();
    })
    .catch((error) => {
      console.log(error);
    });
};

const app = Consumer.create({
  queueUrl: queues['analyticsRequests'],
  handleMessage: handleMessage,
  sqs: sqs
});

// app.on('error', (err) => {
//   console.log(err.message);
// });
// app.start();

module.exports = {sendMessage};


