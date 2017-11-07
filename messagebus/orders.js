const AWS = require('aws-sdk');
const Consumer = require('sqs-consumer');
const queueConfig = require('../messagebus/config/config.js');
const queues = queueConfig.queues;

AWS.config.loadFromPath(__dirname + '/../messagebus/config/queueconfig.json');
var sqs = new AWS.SQS( {apiVersion: '2012-11-05'} );

var sendMessage = (data, queue) => {
  console.log('New order message:', data);
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

module.exports = {sendMessage};
