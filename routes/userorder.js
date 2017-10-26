var express = require('express');
var router = express.Router();
var db = require('../database/index.js');

router.post('/order', (req, res, next) => {
  var {userId, cardId, shippingAddressId, billingAddressId, deliveryType, deliveryCost} = req.body;
  db.createUserOrder(userId, cardId, shippingAddressId, billingAddressId, deliveryType, deliveryCost)
    .then((result) => {
      return db.getUserOrder(result.insertId);
    })
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json(error);
    });
});

router.post('/item', (req, res, next) => {
  var {orderId, itemId, quantity, listedPrice} = req.body;
  db.createOrderItem(orderId, itemId, quantity, listedPrice)
    .then((result) => {
      return db.getOrderItem(result.insertId);
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
