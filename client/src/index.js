$(document).ready(function() {

  var placeUserOrder = (orderId, purchasedAt) => {
    purchasedAt = purchasedAt || moment(faker.date.between(periodStart, periodEnd)).format('YYYY-MM-DD HH:mm:ss');
    var data = JSON.stringify({orderId, purchasedAt});
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

  $('#user_order').click(() => {
    var userOrderId = Number($('#user_order_id').val());
    return getUserOrderWithDetails(userOrderId)
      .then((result) => {
        console.log(result);
      });
  });

});

