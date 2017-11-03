var express = require('express');
var router = express.Router();
var db = require('../database/index.js');
var ordersSQS = require('../messagebus/orders.js');

router.post('/', (req, res, next) => {
  var {userId, cardId, shippingAddressId, billingAddressId, deliveryType, deliveryCost, createdAt} = req.body;
  db.createUserOrder(userId, cardId, shippingAddressId, billingAddressId, deliveryType, deliveryCost, createdAt)
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

router.get('/', (req, res, next) => {
  var orderId = req.query.orderId;
  db.getUserOrderWithDetails(orderId)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json(error);
    });
});

router.get('/random', (req, res, next) => {
  db.getRandomUserOrder()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json(error);
    });
});

router.post('/item', (req, res, next) => {
  var {orderId, itemId, sellerId, quantity, listedPrice, createdAt} = req.body;
  db.createOrderItem(orderId, itemId, sellerId, quantity, listedPrice, createdAt)
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

router.post('/place', (req, res, next) => {
  var {orderId, purchasedAt} = req.body;
  db.placeUserOrder(orderId, purchasedAt)
    .then((result) => {
      return db.getUserOrderWithDetails(orderId);
    })
    .then((result) => {
      return ordersSQS.sendMessage(result, 'orders');
    })
    .then((result) => {
      console.log('Message sent:', result.MessageId);
      return db.getUserOrder(orderId);
    })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json(error);
    });
});

module.exports = router;
