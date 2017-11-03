var params = {};

process.argv.forEach(function (param, index, array) {
  console.log(index + ': ' + param);
  var key = param.split('=')[0];
  var value = param.split('=')[1];
  params[key] = value;
});

var log = Number(params['log']) || 0;
var repeat = Number(params['repeat']) || 0;
const periodStart = '2017-07-25';
const periodEnd = '2017-10-25';
const port = process.env.PORT || 3000;
const server = `http://127.0.0.1:${port}/`;

const faker = require('faker');
const moment = require('moment');
const Promise = require('bluebird');
const axios = require('axios');
const cron = require('node-cron');
const randomData = require('../../server/fakeData/data');
const states = randomData.states;
const userAgents = randomData.userAgents;

var parser = require('ua-parser-js');


var createUser = (firstName, lastName, email, phone, password, createdAt) => {
  var data = {
    firstName: firstName || faker.name.firstName(),
    lastName: lastName || faker.name.lastName(),
    email: email || faker.internet.email(),
    phone: phone || faker.phone.phoneNumber(),
    password: password || faker.internet.password(),
    createdAt: createdAt || moment(faker.date.between(periodStart, periodEnd)).format('YYYY-MM-DD HH:mm:ss'),
  };
  return axios.post(server + 'profile/user', data);
};

var createAddress = (userId, name, street, city, state, country, zip, createdAt) => {
  //created_at, userId, name, street, city, state, country, zip
  // if (state === undefined) {
  //   var randomNumber = faker.random.number({min: 0, max: 3});
  //   if (randomNumber === 3) {
  //     var almostRandomState = states[faker.random.number({min: 0, max: states.length})];
  //   } else {
  //     state = faker.address.stateAbbr();
  //   } 
  // }
  var data = {
    userId: userId,
    name: name,
    street: street || faker.address.streetAddress('###'),
    city: city || faker.address.city(),
    state: state || faker.address.stateAbbr(),
    country: country || 'USA',
    zip: zip || faker.address.zipCode(),
    createdAt: createdAt || moment(faker.date.between(periodStart, periodEnd)).format('YYYY-MM-DD HH:mm:ss')
  };
  return axios.post(server + 'profile/address', data);
};

var createCard = (userId, num, expires, holder, billingAddressId, cvc, createdAt) => {
  //created_at, userId, num, expires, holder, billingAddressId, cvc
  var data = {
    userId: userId,
    num: num || faker.finance.account(16),
    expires: expires || moment(faker.date.between('2017-07-25', '2018-10-25')).format('YYYY-MM-DD'),
    holder: holder,
    billingAddressId: billingAddressId,
    cvc: cvc || faker.random.number({min: 100, max: 999}),
    createdAt: createdAt || moment(faker.date.between(periodStart, periodEnd)).format('YYYY-MM-DD HH:mm:ss'),
  };
  return axios.post(server + 'profile/card', data);
};

var createUserOrder = (userId, cardId, shippingAddressId, billingAddressId, deliveryType = 'standard', deliveryCost = 0, createdAt = undefined) => {
  //created_at, purchased_at, userId, cardId, shippingAddressId, billingAddressId, deliveryType = 'standard', deliveryCost = 0
  createdAt = createdAt || moment(faker.date.between(periodStart, periodEnd)).format('YYYY-MM-DD HH:mm:ss');
  var data = {userId, cardId, shippingAddressId, billingAddressId, deliveryType, deliveryCost, createdAt};
  return axios.post(server + 'userorder', data);
};

var createOrderItem = (orderId, itemId, sellerId, quantity, listedPrice, createdAt) => {
//created_at, orderId, itemId, sellerId, quantity, listedPrice
  var data = {
    orderId: orderId,
    itemId: itemId || faker.random.number({min: 639, max: 639}),
    sellerId: sellerId || faker.random.number({min: 1, max: 1}),
    quantity: quantity || faker.random.number({min: 1, max: 10}),
    listedPrice: listedPrice || faker.finance.amount(2, 100, 2),
    createdAt: createdAt || moment(faker.date.between(periodStart, periodEnd)).format('YYYY-MM-DD HH:mm:ss'),
  };
  return axios.post(server + 'userorder/item', data);
};

var placeUserOrder = (orderId, purchasedAt) => {
  purchasedAt = purchasedAt || moment(faker.date.between(periodStart, periodEnd)).format('YYYY-MM-DD HH:mm:ss');
  var data = {orderId, purchasedAt};
  return axios.post(server + 'userorder/place', data);
};

var getUserOrderWithDetails = (orderId) => {
  var data = {orderId: orderId};
  return axios.get(server + 'userorder/item', data);
};

var createLogin = (userId, loggedInAt, deviceName, deviceOs) => {
  loggedInAt = loggedInAt || moment(faker.date.between(periodStart, periodEnd)).format('YYYY-MM-DD HH:mm:ss');
  var randomNumber = faker.random.number({min: 0, max: userAgents.length - 1});
  var userAgent = userAgents[randomNumber].useragent;
  var userAgentObj = parser(userAgent);
  deviceName = deviceName || ((userAgentObj.device.name || '') + ' ' + (userAgentObj.device.model || ''));
  deviceOs = deviceOs || ((userAgentObj.os.name || '') + ' ' + (userAgentObj.os.version || ''));
  var data = {userId, loggedInAt, deviceName, deviceOs};
  return axios.post(server + 'profile/login', data);
};

var getLogins = (userId, days) => {
  var data = {userId, days};
  return axios.get(server + 'profile/login', data);
};

var createProfile = (firstName, lastName, email, phone, password, createdAt) => {
  let user;
  let name;
  let shippingAddress;
  let billingAddress;
  let card;
  let result = {};
  let obj;
  return createUser()
    .then((result) => {
      user = result.data[0];
      createLogin(user.id);
    })
    .then((result) => {
      //userId, name, street, city, state, country, zip, createdAt
      name = user.first_name + ' ' + user.last_name;
      return createAddress(user.id, name);
    })
    .then((result) => {
      shippingAddress = result.data[0];
      name = user.first_name + ' ' + user.last_name;
      return createAddress(user.id, name);
    })
    .then((result) => {
      billingAddress = result.data[0];
      //userId, num, expires, holder, billingAddressId, cvc, createdAt
      return createCard(user.id, '', '', name, billingAddress.id);
    })
    .then((result) => {
      card = result.data[0];
      obj = {user, shippingAddress, billingAddress, card};
      result.data = [obj];
      return Promise.resolve(result);
    });
};

var createRandomOrderItem = (orderId, itemId, sellerId, quantity, listedPrice, createdAt) => {
  return axios.get(server + 'userorder/random')
    .then((result) => {
      if (result.data !== undefined) {
        var order = result.data[0];
        return createOrderItem(order.id);
      }
    });
};

var placeRandomUserOrder = (purchasedAt) => {
  var orderId;
  var userId;
  var purchasedAt;
  return axios.get(server + 'userorder/random')
    .then((result) => {
      if (result.data !== undefined) {
        orderId = result.data[0].id;
        userId = result.data[0].user_id;
        //var purchasedAt = purchasedAt || moment(faker.date.between(periodStart, periodEnd)).format('YYYY-MM-DD HH:mm:ss');
        purchasedAt = purchasedAt || moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        return createLogin(userId, purchasedAt);
      }
    })
    .then((result) => {
      return placeUserOrder(orderId, purchasedAt);
    });
};

var createProfileWithOrder = () => {
  let user;
  let shippingAddress;
  let billingAddress;
  let card;
  let order;
  let name;
  let item;
  //firstName, lastName, email, phone, password, createdAt
  return createProfile()
    .then((result) => {
      var data = result.data[0];
      user = data.user;
      shippingAddress = data.shippingAddress;
      billingAddress = data.billingAddress;
      card = data.card;
      //userId, cardId, shippingAddressId, billingAddressId, deliveryType = 'standard', deliveryCost = 0, createdAt = undefined
      return createUserOrder(user.id, card.id, shippingAddress.id, billingAddress.id, 'standard', 0);
    })
    .then((result) => {
      order = result.data[0];
      //orderId, itemId, sellerId, quantity, listedPrice, createdAt
      return createOrderItem(order.id);
    })
    .then((result) => {
      item = result.data[0];
      //orderId, itemId, sellerId, quantity, listedPrice, createdAt
      return createOrderItem(order.id);
    });
};

if (repeat === 1) {
  cron.schedule('*/10 * * * * *', function() {
    createProfileWithOrder()
      .then((result) => {
        console.log('LOGIN createProfileWithOrder:', result.data[0]);
      })
      .catch((error) => {
        console.log('createProfileWithOrder:', error.message);
      });
  });
  cron.schedule('*/30 * * * * *', function() {
    placeRandomUserOrder()
      .then((result) => {
        console.log('placeRandomUserOrder:', result.data[0]);
      })
      .catch((error) => {
        console.log('placeRandomUserOrder:', error.message);
      });
  });
  cron.schedule('*/2 * * * * *', function() {
    createRandomOrderItem()
      .then((result) => {
        console.log('createRandomOrderItem:', result.data[0]);
      })
      .catch((error) => {
        console.log('createRandomOrderItem:', error.message);
      });
  });
} else {
  createProfileWithOrder();
  placeRandomUserOrder();
  createRandomOrderItem();
}



