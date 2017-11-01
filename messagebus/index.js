// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Load credentials and set the region from the JSON file
AWS.config.loadFromPath(__dirname + '/../messagebus/config/awsconfig.json');
const queueConfig = require('../messagebus/config/config.js');

// Create an SQS service object
var sqs = new AWS.SQS( {apiVersion: '2012-11-05'} );

// var params = {
//   DelaySeconds: 10,
//   MessageAttributes: {
//     'Title': {
//       DataType: 'String',
//       StringValue: 'The Whistler'
//     },
//     'Author': {
//       DataType: 'String',
//       StringValue: 'John Grisham'
//     },
//     'WeeksOn': {
//       DataType: 'Number',
//       StringValue: '6'
//     }
//   },
//   MessageBody: 'Information about current NY Times fiction bestseller for week of 12/11/2016.',
//   QueueUrl: queueConfig.QueueUrl
// };

// sqs.sendMessage(params, function(err, data) {
//   if (err) {
//     console.log("Error", err);
//   } else {
//     console.log("Success", data.MessageId);
//   }
// });

module.exports = {sqs};