const fs = require('fs');
const faker = require('faker');
const moment = require('moment');
const Promise = require('bluebird');
const lineReader = require('readline');
const parser = require('ua-parser-js');

const randomData = require('../../server/fakeData/data');
const states = randomData.states;
const userAgents = randomData.userAgents;

var params = {};

process.argv.forEach(function (param, index, array) {
  console.log(index + ': ' + param);
  var key = param.split('=')[0];
  var value = param.split('=')[1];
  params[key] = value;
});

const User = Number(params['user']) || 0;
const NumberOfUsers = Number(params['number']) || 0;
const Address = Number(params['address']) || 0;
const Card = Number(params['card']) || 0;
const Order = Number(params['order']) || 0;
const Item = Number(params['item']) || 0;

const periodStart = '2017-07-25';
const periodEnd = '2017-10-25';
const periodEndPlus2Years = '2019-10-25';
const encoding = 'utf8';

const userFile = __dirname + '/user.csv';
const userDBFile = __dirname + '/userdb.csv';
const loginFile = __dirname + '/login.csv';
const loginDBFile = __dirname + '/logindb.csv';
const addressFile = __dirname + '/address.csv';
const addressDBFile = __dirname + '/addressdb.csv';
const cardFile = __dirname + '/card.csv';
const cardDBFile = __dirname + '/carddb.csv';
const userOrderFile = __dirname + '/user_order.csv';
const userOrderDBFile = __dirname + '/user_orderdb.csv';
const orderItemFile = __dirname + '/order_item.csv';
const orderItemDBFile = __dirname + '/order_itemdb.csv';

var userWriter = fs.createWriteStream(userFile);
var loginWriter = fs.createWriteStream(loginFile);
var addressWriter = fs.createWriteStream(addressFile);
var cardWriter = fs.createWriteStream(cardFile);
var userOrderWriter = fs.createWriteStream(userOrderFile);
var orderItemWriter = fs.createWriteStream(orderItemFile);

var createUserData = () => {
  var firstName = faker.name.firstName();
  var lastName = faker.name.lastName();
  var phone = faker.phone.phoneNumber();
  firstName = firstName.replace("'", "''");
  lastName = lastName.replace("'", "''");
  phone = phone.replace(') ', '');
  phone = phone.replace(/[-().]/g, '');
  var data = [firstName, lastName, firstName + lastName + phone + '@oblakoclone2.com', phone, faker.internet.password(), 
    moment(faker.date.between(periodStart, periodEnd)).format('YYYY-MM-DD HH:mm:ss')].join(';') + '\n';
  return data;
};

var createLoginData = (userId, loggedInAt) => {
  var randomNumber = faker.random.number({min: 0, max: userAgents.length - 1});
  var userAgent = userAgents[randomNumber].useragent;
  var userAgentObj = parser(userAgent);
  var deviceName = ((userAgentObj.device.name || '') + ' ' + (userAgentObj.device.model || ''));
  var deviceOs = ((userAgentObj.os.name || '') + ' ' + (userAgentObj.os.version || ''));
  if ((deviceName === '') && (deviceOs === '')) {
    deviceName = 'IPhone SE';
    deviceOs = 'iOS 11.1';
  }
  return [userId, loggedInAt, deviceName, deviceOs].join(';') + '\n';
};

var createAddressData = (userId, createdAt, name) => {
  var street = faker.address.streetAddress('###');
  var city = faker.address.city();
  var state = faker.address.stateAbbr();
  var country = 'USA';
  var zip = faker.address.zipCode();
  return [createdAt, userId, name, street, city, state, country, zip].join(';') + '\n';
};

var createCardData = (userId, holder, billingAddressId, createdAt, expires) => {
  var num = faker.finance.account(16);
  var cvc = faker.random.number({min: 100, max: 999});
  return [createdAt, userId, num, expires, holder, billingAddressId, cvc].join(';') + '\n';
};

var createOrderItemData = (orderId, orderCreatedAt) => {
  var itemId = 639; //faker.random.number({min: 1, max: 10000});
  var sellerId = 1; //faker.random.number({min: 1, max: 1000});
  var quantity = faker.random.number({min: 1, max: 10});
  var listedPrice = faker.finance.amount(2, 100, 2);
  var createdAt = orderCreatedAt;
  return [createdAt, orderId, itemId, sellerId, quantity, listedPrice].join(';') + '\n';
};

var writeUsers = (callback) => {
  let i = NumberOfUsers;
  var write = () => {
    let ok = true;
    do {
      i--;
      if (i === 0) {
        userWriter.write(createUserData(), encoding, callback);
      } else {
        ok = userWriter.write(createUserData(), encoding);
      }
    } while (i > 0 && ok);
    if (i > 0) {
      userWriter.once('drain', write);
    }
  };
  write();
};

var writeLoginsAndAddresses = (userReader) => {
  var lineReaderInterface = lineReader.createInterface({
    input: userReader
  });
  lineReaderInterface.on('line', function (line) {
    var userData = line.split(';');
    var firstLoginDate = userData[1];
    var name = userData[2] + ' ' + userData[3];
    var secondLoginDate = moment(faker.date.between(firstLoginDate, periodEnd)).format('YYYY-MM-DD HH:mm:ss');
    loginWriter.write(createLoginData(userData[0], firstLoginDate));
    loginWriter.write(createLoginData(userData[0], secondLoginDate));
    addressWriter.write(createAddressData(userData[0], firstLoginDate, name));
    addressWriter.write(createAddressData(userData[0], secondLoginDate, name));
  });
};

var writeCards = (addressReader) => {
  var lineReaderInterface = lineReader.createInterface({
    input: addressReader
  });
  lineReaderInterface.on('line', function (line) {
    var addressData = line.split(';');
    var billingAddressId = addressData[0];
    var addressCreatedAt = addressData[1];
    var userId = addressData[2];
    var holder = addressData[3];
    var createdAt = moment(faker.date.between(addressCreatedAt, periodEnd)).format('YYYY-MM-DD HH:mm:ss');
    var expires = moment(faker.date.between(createdAt, periodEndPlus2Years)).format('YYYY-MM-DD HH:mm:ss');
    cardWriter.write(createCardData(userId, holder, billingAddressId, createdAt, expires));
  });
};

var writeUserOrders = (cardReader) => {
  var lineReaderInterface = lineReader.createInterface({
    input: cardReader
  });
  lineReaderInterface.on('line', function (line) {
    var cardData = line.split(';');
    var cardId = cardData[0];
    var cardCreatedAt = cardData[1];
    var userId = cardData[2];
    var billingAddressId = cardData[6];
    var createdAt = moment(faker.date.between(cardCreatedAt, periodEnd)).format('YYYY-MM-DD HH:mm:ss');
    var data = [createdAt, userId, cardId, billingAddressId, billingAddressId, 'standard'].join(';') + '\n';
    userOrderWriter.write(data);
  });
};

var writeOrderItems = (userOrderReader) => {
  var lineReaderInterface = lineReader.createInterface({
    input: userOrderReader
  });
  lineReaderInterface.on('line', function (line) {
    var userOrderData = line.split(';');
    var userOrderId = userOrderData[0];
    var userOrderCreatedAt = userOrderData[1];
    orderItemWriter.write(createOrderItemData(userOrderId, userOrderCreatedAt));
  });
};

if (User) {
  writeUsers((error, result) => {
    if (error) {
      console.log('writeUsers error: ', result);
    } else {
      console.log('writeUsers result: ', result);
    }
  });
  let query1 = `LOAD DATA INFILE '${userFile}' IGNORE INTO TABLE user 
      FIELDS TERMINATED BY ';' LINES TERMINATED BY '\n' STARTING BY '' (first_name, last_name, email, phone, password, created_at);`;
  let query2 = `SELECT * INTO OUTFILE '${userDBFile}' FIELDS TERMINATED BY ';' LINES TERMINATED BY '\n' FROM user;`;
  console.log(query1);
  console.log(query2);
}

if (Address) {
  let userReader = fs.createReadStream(userDBFile);
  writeLoginsAndAddresses(userReader);
  let query1 = `LOAD DATA INFILE '${loginFile}' IGNORE INTO TABLE login FIELDS TERMINATED BY ';' LINES TERMINATED BY '\n' STARTING BY '' (user_id, logged_in_at, device_name, device_os);`;
  let query2 = `LOAD DATA INFILE '${addressFile}'
      IGNORE INTO TABLE address FIELDS TERMINATED BY ';' 
      LINES TERMINATED BY '\n' STARTING BY '' (created_at, user_id, name, street, city, state, country, zip);`;
  let query3 = `SELECT * INTO OUTFILE '${addressDBFile}' FIELDS TERMINATED BY ';' LINES TERMINATED BY '\n' FROM address;`;
  console.log(query1);
  console.log(query2);
  console.log(query3);
}

if (Card) {
  let addressReader = fs.createReadStream(addressDBFile);
  writeCards(addressReader);
  let query1 = `LOAD DATA INFILE '${cardFile}' IGNORE INTO TABLE card FIELDS TERMINATED BY ';' 
      LINES TERMINATED BY '\n' STARTING BY '' (created_at, user_id, num, expires, holder, billing_address_id, cvc);`;
  let query2 = `SELECT * INTO OUTFILE '${cardDBFile}' FIELDS TERMINATED BY ';' LINES TERMINATED BY '\n' FROM card;`;
  console.log(query1);
  console.log(query2);
}

if (Order) {
  let cardReader = fs.createReadStream(cardDBFile);
  writeUserOrders(cardReader);
  let query1 = `LOAD DATA INFILE '${userOrderFile}' IGNORE INTO TABLE user_order FIELDS TERMINATED BY ';' 
    LINES TERMINATED BY '\n' STARTING BY '' (created_at, user_id, card_id, shipping_address_id, billing_address_id, delivery_type);`;
  let query2 = `SELECT * INTO OUTFILE '${userOrderDBFile}' FIELDS TERMINATED BY ';' LINES TERMINATED BY '\n' FROM user_order;`;
  console.log(query1);
  console.log(query2);
}

if (Item) {
  let userOrderReader = fs.createReadStream(userOrderDBFile);
  writeOrderItems(userOrderReader);
  let query1 = `LOAD DATA INFILE '${orderItemFile}' IGNORE INTO TABLE order_item FIELDS TERMINATED BY ';' 
      LINES TERMINATED BY '\n' STARTING BY '' (created_at, order_id, item_id, seller_id, quantity, listed_price);`;
  console.log(query1);
}

