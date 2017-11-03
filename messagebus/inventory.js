const AWS = require('aws-sdk');
const Consumer = require('sqs-consumer');
const queueConfig = require('../messagebus/config/config.js');
const queues = queueConfig.queues;
//const db = require('../database/index.js');

AWS.config.loadFromPath(__dirname + '/../messagebus/config/inventoryconfig.json');
var sqs = new AWS.SQS( {apiVersion: '2012-11-05'} );

var handleMessage = (message, callback) => {
  var body = JSON.parse(message.Body);
  console.log(message);
  callback();
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


