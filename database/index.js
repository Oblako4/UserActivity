var mysql = require('mysql');
var moment = require('moment');

var Promise = require('bluebird');

var mysqlConnection = mysql.createConnection({
  host: process.env.DBSERVER || 'localhost',
  user: process.env.DBUSER || 'root',
  password: process.env.DBPASSWORD || '',
  database: process.env.DBNAME || 'user_activity'
});

mysqlConnection.connect(function(err) {
  if (err) {
    console.log(process.env.DBNAME);
    console.error('Could not connect to db', err);
  } else {
    console.log('Connected to db');
  }
});

var connection = Promise.promisifyAll(mysqlConnection);

module.exports = {

};
