var express = require('express');
var router = express.Router();
var db = require('../database/index.js');
//var bcrypt = require('bcrypt'); to store passwords

router.post('/create', (req, res, next) => {
  var firstName = req.body.firstName.replace("'", "''");
  var lastName = req.body.lastName.replace("'", "''");
  //need to clean phone numbers too
  db.createUser(firstName, lastName, req.body.email, req.body.phone, req.body.password)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
});

module.exports = router;
