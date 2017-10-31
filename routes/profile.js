var express = require('express');
var router = express.Router();
var db = require('../database/index.js');
//var bcrypt = require('bcrypt'); to store passwords

router.post('/user', (req, res, next) => {
  //need to clean phone numbers
  var {firstName, lastName, email, phone, password, createdAt} = req.body;
  firstName = firstName.replace("'", "''");
  lastName = lastName.replace("'", "''");
  db.createUser(firstName, lastName, email, phone, password, createdAt)
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

router.post('/login', (req, res, next) => {
  var {userId, loggedInAt, deviceName, deviceOs} = req.body;
  db.createLogin(userId, loggedInAt, deviceName, deviceOs)
    .then((result) => {
      return db.getLogin(result.insertId);
    })
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json(error);
    });
});

router.get('/login', (req, res, next) => {
  var userId = req.query.userId;
  var days = req.query.days;
  db.getLogins(userId, days)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json(error);
    });
});

router.post('/address', (req, res, next) => {
  var {userId, name, street, city, state, country, zip, createdAt} = req.body;
  name = name.replace("'", "''");
  street = street.replace("'", "''");
  city = city.replace("'", "''");
  db.createAddress(userId, name, street, city, state, country, zip, createdAt)
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
  //userId, num, expires, holder, billingAddressId, cvc
  var {userId, num, expires, holder, billingAddressId, cvc, createdAt} = req.body;
  holder = holder.replace("'", "''");
  db.createCard(userId, num, expires, holder, billingAddressId, cvc, createdAt)
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
