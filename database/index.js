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

var createUser = (firstName, lastName, email, phone, password, createdAt) => {
  createdAt = createdAt === undefined ? moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') : createdAt;
  var query = `INSERT INTO user (first_name, last_name, email, phone, password, created_at)
    VALUES ('${firstName}', '${lastName}', '${email}', '${phone}', '${password}', '${createdAt}')`;
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

var createAddress = (userId, name, street, city, state, country, zip, createdAt) => {
  createdAt = createdAt === undefined ? moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') : createdAt;
  var query = `INSERT INTO address (user_id, name, street, city, state, country, zip, created_at)
    VALUES ('${userId}', '${name}', '${street}', '${city}', '${state}', '${country}', '${zip}','${createdAt}')`;
  return connection.queryAsync(query);
};

var getAddress = (addressId) => {
  var query = `SELECT * FROM address WHERE id=${addressId}`;
  return connection.queryAsync(query);
};

var createCard = (userId, num, expires, holder, billingAddressId, cvc, createdAt) => {
  createdAt = createdAt === undefined ? moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') : createdAt;
  var query = `INSERT INTO card (user_id, num, expires, holder, billing_address_id, cvc, created_at)
    VALUES ('${userId}', '${num}', '${expires}', '${holder}', '${billingAddressId}', '${cvc}', '${createdAt}')`;
  return connection.queryAsync(query);
};

var getCard = (cardId) => {
  var query = `SELECT * FROM card WHERE id=${cardId}`;
  return connection.queryAsync(query);
};

var createUserOrder = (userId, cardId, shippingAddressId, billingAddressId, deliveryType = 'standard', deliveryCost = 0, createdAt = undefined) => {
  createdAt = createdAt === undefined ? moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') : createdAt;
  var query = `INSERT INTO user_order (user_id, card_id, shipping_address_id, billing_address_id, delivery_type, delivery_cost, created_at)
    VALUES ('${userId}', '${cardId}', '${shippingAddressId}', '${billingAddressId}', '${deliveryType}', '${deliveryCost}', '${createdAt}')`;
  return connection.queryAsync(query);
};

var getUserOrder = (userOrderId) => {
  var query = `SELECT * FROM user_order WHERE id=${userOrderId}`;
  return connection.queryAsync(query);
};

var placeUserOrder = (orderId, purchasedAt) => {
  purchasedAt = purchasedAt === undefined ? moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') : purchasedAt;
  var query = `UPDATE user_order SET status="placed", purchased_at="${purchasedAt}" WHERE id=${orderId}`;
  return connection.queryAsync(query);
};

var createOrderItem = (orderId, itemId, sellerId, quantity, listedPrice, createdAt) => {
  createdAt = createdAt === undefined ? moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') : createdAt;
  var query = `INSERT INTO order_item (order_id, item_id, seller_id, quantity, listed_price, created_at)
    VALUES ('${orderId}', '${itemId}', '${sellerId}', '${quantity}', '${listedPrice}', '${createdAt}')`;
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

/*random*/

var getRandomUserOrder = () => {
  var query = 'SELECT * FROM user_order WHERE status="in_progress" ORDER BY RAND() LIMIT 1';
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
//      "seller_id":34,
//      "quantity":1,
//      "listed_price":94.81},
//     {"id":4,
//      "created_at":"2017-10-26T19:09:13.000Z",
//      "order_id":2,
//      "item_id":7209,
//      "seller_id":36,
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
  createSearchResult,
  getRandomUserOrder
};

