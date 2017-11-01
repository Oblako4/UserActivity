var Promise = require('bluebird');
var express = require('express');
var bodyParser = require('body-parser');
var sqs = require('../messagebus/index.js');

var app = express();

app.use(bodyParser.json());

app.use(express.static(__dirname + '/../client'));

var routeProfile = require('../routes/profile');
var routeUserOrder = require('../routes/userorder');

app.use('/profile', routeProfile);
app.use('/userorder', routeUserOrder);

var port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Listening on port 3000');
});

