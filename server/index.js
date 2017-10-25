var Promise = require('bluebird');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.use(express.static(__dirname + '/../client'));

var routeProfile = require('../routes/profile');

app.use('/profile', routeProfile);

var port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Listening on port 3000');
});

