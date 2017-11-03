var Promise = require('bluebird');
var express = require('express');
var bodyParser = require('body-parser');
var analyticsSQS = require('../messagebus/analytics.js');
var elasticsearch = require('../elasticsearch/index');
var cluster = require('cluster');

var app = express();

app.use(bodyParser.json());

app.use(express.static(__dirname + '/../client'));

var routeProfile = require('../routes/profile');
var routeUserOrder = require('../routes/userorder');

app.use('/profile', routeProfile);
app.use('/userorder', routeUserOrder);

var port = process.env.PORT || 3000;

if(cluster.isMaster) {
	var numWorkers = require('os').cpus().length;
	console.log('Master cluster setting up ' + numWorkers + ' workers...');

  for(var i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on('online', function(worker) {
      console.log('Worker ' + worker.process.pid + ' is online');
  });

  cluster.on('exit', function(worker, code, signal) {
      console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
      console.log('Starting a new worker');
      cluster.fork();
  });
} else {
    app.all('/*', function(req, res) {res.send('process ' + process.pid + ' says hello!').end();})

    var server = app.listen(port, function() {
        console.log('Process ' + process.pid + ' is listening to all incoming requests');
    });
}



