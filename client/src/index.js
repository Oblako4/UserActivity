$(document).ready(function() {

  var createUser = () => {
    //firstName, lastName, email, phone, password
    var data = JSON.stringify({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.phoneNumber(),
      password: faker.internet.password()
    });
    return $.ajax({
      type: 'POST',
      url: 'profile/user',
      data: data,
      contentType: 'application/json',
      dataType: 'json'
    });
  };

  var createAddress = (userId, firstName, lastName, type) => {
    //userId, name, street, city, state, country, zip, type, isDefault = 0
    var data = JSON.stringify({
      userId: userId,
      name: firstName + ' ' + lastName,
      street: faker.address.streetAddress('###'),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      country: 'USA',
      zip: faker.address.zipCode(),
      type: type
    });
    return $.ajax({
      type: 'POST',
      url: 'profile/address',
      data: data,
      contentType: 'application/json',
      dataType: 'json'
    });
  };

  var createCard = (userId, firstName, lastName, billingAddressId, isDefault) => {
    //userId, num, expires, holder, billingAddressId, cvc, isDefault
    var data = JSON.stringify({
      userId: userId,
      num: faker.finance.account(16),
      //expires: moment(faker.date.between('2017-07-25', '2018-10-25')).format('YYYY-MM-DD'),
      expires: '2018-09-01',
      holder: firstName + ' ' + lastName,
      billingAddressId: billingAddressId,
      cvc: faker.random.number({min: 100, max: 999}),
      isDefault: isDefault
    });
    return $.ajax({
      type: 'POST',
      url: 'profile/card',
      data: data,
      contentType: 'application/json',
      dataType: 'json'
    });
  };

  var createUserOrder = (userId, cardId, shippingAddressId, billingAddressId, deliveryType, deliveryCost) => {
    //userId, cardId, shippingAddressId, billingAddressId, deliveryType = 'standard', deliveryCost = 0
    var data = JSON.stringify({userId, cardId, shippingAddressId, billingAddressId, deliveryType, deliveryCost});
    return $.ajax({
      type: 'POST',
      url: 'userorder',
      data: data,
      contentType: 'application/json',
      dataType: 'json'
    });
  };

  var createOrderItem = (orderId, itemId) => {
  //orderId, itemId, quantity, listedPrice
    var data = JSON.stringify({
      orderId: orderId,
      itemId: faker.random.number({min: 1, max: 10000}),
      quantity: faker.random.number({min: 1, max: 10}),
      listedPrice: faker.finance.amount(2, 100, 2)
    });
    return $.ajax({
      type: 'POST',
      url: 'userorder/item',
      data: data,
      contentType: 'application/json',
      dataType: 'json'
    });
  };

  var placeUserOrder = (orderId) => {
    var data = JSON.stringify({orderId});
    return $.ajax({
      type: 'POST',
      url: 'userorder/place',
      data: data,
      contentType: 'application/json',
      dataType: 'json'
    });
  };

  var getUserOrderWithDetails = (orderId) => {
    var data = {orderId: orderId};
    return $.ajax({
      type: 'GET',
      url: 'userorder',
      data: data,
      contentType: 'application/json',
      dataType: 'json'
    });
  };

  $('#profile').click(() => {
    var count = Number($('#quantity').val());
    for (let i = 0; i < count; i++) {
      let data;
      let user;
      let shippingAddress;
      let billingAddress;
      let card;
      let order;
      createUser()
        .then((result) => {
          user = result[0];
          console.log('user:', user);
          return createAddress(user.id, user.first_name, user.last_name, 'shipping');
        })
        .then((result) => {
          shippingAddress = result[0];
          console.log('shippingAddress:', shippingAddress);
          return createAddress(user.id, user.first_name, user.last_name, 'billing');
        })
        .then((result) => {
          billingAddress = result[0];
          console.log('billingAddress:', billingAddress);
          return createCard(user.id, user.first_name, user.last_name, billingAddress.id, 1);
        })
        .then((result) => {
          card = result[0];
          console.log('card:', card);
          return createUserOrder(user.id, card.id, shippingAddress.id, billingAddress.id, 'standard', 0);
        })
        .then((result) => {
          order = result[0];
          console.log('order:', order);
          return createOrderItem(order.id);
        })
        .then((result) => {
          item = result[0];
          console.log('item:', item);
          return createOrderItem(order.id);
        })
        .then((result) => {
          item = result[0];
          console.log('item:', item);
          return placeUserOrder(order.id);
        })
        .done((result) => {
          console.log('order:', order);
        })
        .fail((error) => {
          console.error(error);
        });
    }
  });
  $('#user_order').click(() => {
    var userOrderId = Number($('#user_order_id').val());
    return getUserOrderWithDetails(userOrderId)
      .then((result) => {
        console.log(result);
      });
  });
});

