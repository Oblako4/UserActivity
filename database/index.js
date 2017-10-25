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

var createCard = (userId, num, expires, holder, billingAddressId, cvc, isDefault = 0) => {
  var query = `INSERT INTO card (user_id, num, expires, holder, billing_address_id, cvc, is_default)
    VALUES ('${userId}', '${num}', '${expires}', '${holder}', '${billingAddressId}', '${cvc}', '${isDefault}')`;
  return connection.queryAsync(query);
};

var createUserOrder = (userId, cardId, shippingAddressId, billingAddressId, deliveryType = 'standard', deliveryCost = 0) => {
  var query = `INSERT INTO user_order (user_id, card_id, shipping_address_id, billing_address_id, delivery_type, delivery_cost)
    VALUES ('${userId}', '${cardId}', '${shippingAddressId}', '${billingAddressId}', '${deliveryType}', '${deliveryCost}')`;
  return connection.queryAsync(query);
};

var createOrderItem = (orderId, itemId, quantity, listedPrice) => {
  var query = `INSERT INTO order_item (order_id, item_id, quantity, listed_price)
    VALUES ('${orderId}', '${itemId}', '${quantity}', '${listedPrice}')`;
  return connection.queryAsync(query);
};

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

//test data structure
//var userId;
// var billingAddressId;
// var shippingAddressId;
// var cardId;
// var searchId;
// createUser('Ivan', 'Ivanov', 'eqre@gmail.com', '6692379977', 'password111')
//   .then((result) => {
//     console.log(result);
//     userId = result.insertId;
//     return createLogin(userId, 'MAC book pro', 'Mac OS');
//   })
//   .then((result) => {
//     return createAddress(userId, 'Ivan Ivanov', '944 Market street', 'San Francisco', 'CA', 'USA', '95122', 'shipping', 1);
//   })
//   .then((result) => {
//     shippingAddressId = result.insertId;
//     return createAddress(userId, 'Ivan Ivanov', '944 Market street', 'San Francisco', 'CA', 'USA', '95122', 'billing', 1);
//   })
//   .then((result) => {
//     billingAddressId = result.insertId;
//     return createCard(userId, '6677009988990011', '2017-09-01', 'Ivan Ivanov', billingAddressId, 453, 1);
//   })
//   .then((result) => {
//     cardId = result.insertId;
//     return createUserOrder(userId, cardId, shippingAddressId, billingAddressId, 'standard', 0);
//   })
//   .then((result) => {
//     orderId = result.insertId;
//     return createOrderItem(orderId, 9943, 1, 5634.0);
//   })
//   .then((result) => {
//     return createSearch(userId, 'black t-shirt');
//   })
//   .then((result) => {
//     searchId = result.insertId;
//     return createSearchResult(searchId, 9943, 1);
//   })
//   .catch((error) => {
//     console.error('Test data generation error', error);
//   });


module.exports = {
  createUser,
  createLogin,
  createAddress,
  createCard,
  createUserOrder,
  createOrderItem,
  createSearch,
  createSearchResult
};

