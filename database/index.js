var mysql = require('mysql');
var moment = require('moment');

var Promise = require('bluebird');

var mysqlConnection = mysql.createConnection({
  host: process.env.DBSERVER || 'localhost',
  user: process.env.DBUSER || 'root',
  password: process.env.DBPASSWORD || '',
  database: process.env.DBNAME || 'user_activity'
});

mysqlConnection.connect((error) => {
  if (error) {
    console.log(process.env.DBNAME);
    console.error('Could not connect to db', error);
  } else {
    console.log('Connected to db');
  }
});

var connection = Promise.promisifyAll(mysqlConnection);

var createUser = (firstName, lastName, email, phone, password) => {
  var query = `INSERT INTO user (first_name, last_name, email, phone, password)
    VALUES ('${firstName}', '${lastName}', '${email}', '${phone}', '${password}')`;
  return connection.queryAsync(query);
};

var getUser = (userId) => {
  var query = `SELECT id, first_name, last_name, email, phone FROM user WHERE id=${userId}`;
  return connection.queryAsync(query);
};

var createLogin = (userId, deviceName, deviceOS) => {
  var query = `INSERT INTO login (user_id, device_name, device_os)
    VALUES ('${userId}', '${deviceName}', '${deviceOS}')`;
  return connection.queryAsync(query);
};

var createAddress = (userId, name, street, city, state, country, zip, type, isDefault = 0) => {
  var query = `INSERT INTO address (user_id, name, street, city, state, country, zip, type, is_default)
    VALUES ('${userId}', '${name}', '${street}', '${city}', '${state}', '${country}', '${zip}','${type}','${isDefault}')`;
  return connection.queryAsync(query);
};

var getAddress = (addressId) => {
  var query = `SELECT * FROM address WHERE id=${addressId}`;
  return connection.queryAsync(query);
};

var createCard = (userId, num, expires, holder, billingAddressId, cvc, isDefault = 0) => {
  var query = `INSERT INTO card (user_id, num, expires, holder, billing_address_id, cvc, is_default)
    VALUES ('${userId}', '${num}', '${expires}', '${holder}', '${billingAddressId}', '${cvc}', '${isDefault}')`;
  return connection.queryAsync(query);
};

var getCard = (cardId) => {
  var query = `SELECT * FROM card WHERE id=${cardId}`;
  return connection.queryAsync(query);
};

var createUserOrder = (userId, cardId, shippingAddressId, billingAddressId, deliveryType = 'standard', deliveryCost = 0) => {
  var query = `INSERT INTO user_order (user_id, card_id, shipping_address_id, billing_address_id, delivery_type, delivery_cost)
    VALUES ('${userId}', '${cardId}', '${shippingAddressId}', '${billingAddressId}', '${deliveryType}', '${deliveryCost}')`;
  return connection.queryAsync(query);
};

var getUserOrder = (userOrderId) => {
  var query = `SELECT * FROM user_order WHERE id=${userOrderId}`;
  return connection.queryAsync(query);
};

var placeUserOrder = (orderId) => {
  var date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  var query = `UPDATE user_order SET status="placed", purchased_at="${date}" WHERE id=${orderId}`;
  return connection.queryAsync(query);
};

var createOrderItem = (orderId, itemId, quantity, listedPrice) => {
  var query = `INSERT INTO order_item (order_id, item_id, quantity, listed_price)
    VALUES ('${orderId}', '${itemId}', '${quantity}', '${listedPrice}')`;
  return connection.queryAsync(query);
};

var getOrderItem = (userOrderItemId) => {
  var query = `SELECT * FROM order_item WHERE id=${userOrderItemId}`;
  return connection.queryAsync(query);
};

var getOrderItems = (orderId) => {
  var query = `SELECT * FROM order_item WHERE order_id=${orderId}`;
  return connection.queryAsync(query);
};

var getUserOrderWithDetails = (orderId) => {
  var resultObj = {};
  var resultOrder = {};
  var order;
  return getUserOrder(orderId)
    .then((result) => {
      order = result[0];
      resultOrder = {
        'id': order.id,
        'user_id': order.user_id,
        'purchased_at': order.purchased_at};
      return getCard(order.card_id);
    })
    .then((result) => {
      var card = result[0];
      resultOrder['card'] = {};
      resultOrder['card'].id = card.id;
      resultOrder['card'].num = card.num;
      return getAddress(order.billing_address_id);
    })
    .then((result) => {
      var billingAddress = result[0];
      resultOrder['billing_address'] = {};
      resultOrder['billing_address'] = {
        'id': billingAddress.id,
        'name': billingAddress.name,
        'street': billingAddress.street,
        'city': billingAddress.city,
        'state': billingAddress.state,
        'country': billingAddress.country,
        'zip': billingAddress.zip
      };
      return getAddress(order.shipping_address_id);
    })
    .then((result) => {
      var shippingAddress = result[0];
      resultOrder['shipping_address'] = {};
      resultOrder['shipping_address'] = {
        'id': shippingAddress.id,
        'name': shippingAddress.name,
        'street': shippingAddress.street,
        'city': shippingAddress.city,
        'state': shippingAddress.state,
        'country': shippingAddress.country,
        'zip': shippingAddress.zip
      };
      return getOrderItems(order.id);
    })
    .then((result) => {
      var totalPrice = result.reduce((acc, item) => {
        return acc + item.quantity * item.listed_price;
      }, 0);
      resultOrder['items'] = result;
      resultObj['order'] = resultOrder;
      resultObj['total_price'] = totalPrice;
      return Promise.resolve(resultObj);
    })
    .catch((error) => {
      console.error('getUserOrderWithDetails error:', error);
    });
};

//{"order":
//  {"id":2,
//   "user_id":2,
//   "purchased_at":"2017-10-26T19:09:13.000Z",
//   "total_price":0,
//   "card": {"id":2,
//     "num":"0472389144657800"},
//   "billing_address":{"id":4,
//     "name":"Carmen Yundt",
//     "street":"56330 Weber Stravenue Apt. 551",
//     "city":"Sengertown",
//     "state":"OH",
//     "country":"USA",
//     "zip":"49667-4393"},
//   "shipping_address":{"id":4,
//     "name":"Carmen Yundt",
//     "street":"56330 Weber Stravenue Apt. 551",
//     "city":"Sengertown",
//     "state":"OH",
//     "country":"USA",
//     "zip":"49667-4393"},
//   "items": [
//     {"id":3,
//      "created_at":"2017-10-26T19:09:13.000Z",
//      "order_id":2,
//      "item_id":9437,
//      "quantity":1,
//      "listed_price":94.81},
//     {"id":4,
//      "created_at":"2017-10-26T19:09:13.000Z",
//      "order_id":2,
//      "item_id":7209,
//      "quantity":3,
//      "listed_price":75.03}
//    ]
//}}

var createSearch = (userId, query) => {
  var query = `INSERT INTO search (user_id, query)
    VALUES ('${userId}', '${query}')`;
  return connection.queryAsync(query);
};

var createSearchResult = (searchId, itemId, position) => {
  var query = `INSERT INTO search_result (search_id, item_id, position)
    VALUES ('${searchId}', '${itemId}', '${position}')`;
  return connection.queryAsync(query);
};

module.exports = {
  createUser,
  getUser,
  createLogin,
  createAddress,
  getAddress,
  createCard,
  getCard,
  createUserOrder,
  getUserOrder,
  getUserOrderWithDetails,
  placeUserOrder,
  createOrderItem,
  getOrderItem,
  createSearch,
  createSearchResult
};

