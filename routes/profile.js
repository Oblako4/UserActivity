var express = require('express');
var router = express.Router();
var db = require('../database/index.js');
//var bcrypt = require('bcrypt'); to store passwords

router.post('/user', (req, res, next) => {
  //need to clean phone numbers
  var {firstName, lastName, email, phone, password} = req.body;
  firstName = firstName.replace("'", "''");
  lastName = lastName.replace("'", "''");
  db.createUser(firstName, lastName, email, phone, password)
    .then((result) => {
      return db.getUser(result.insertId);
    })
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json(error);
    });
});

router.post('/address', (req, res, next) => {
  var {userId, name, street, city, state, country, zip, type} = req.body;
  name = name.replace("'", "''");
  street = street.replace("'", "''");
  city = city.replace("'", "''");
  db.createAddress(userId, name, street, city, state, country, zip, type)
    .then((result) => {
      return db.getAddress(result.insertId);
    })
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json(error);
    });
});

router.post('/card', (req, res, next) => {
  //userId, num, expires, holder, billingAddressId, cvc, isDefault = 0
  var {userId, num, expires, holder, billingAddressId, cvc, isDefault} = req.body;
  holder = holder.replace("'", "''");
  db.createCard(userId, num, expires, holder, billingAddressId, cvc, isDefault)
    .then((result) => {
      return db.getCard(result.insertId);
    })
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json(error);
    });
});

module.exports = router;
