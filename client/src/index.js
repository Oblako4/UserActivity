$(document).ready(function() {

  $('#client').click(function() {
    var count = Number($('#cl_quantity').val());
    var data;
    for (var i = 0; i < count; i++) {
      data = JSON.stringify({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.phoneNumber(),
        password: faker.internet.password()
      });
      $.ajax({
        type: 'POST',
        url: 'profile/create', 
        data: data,
        contentType: 'application/json',
        dataType: 'json',
        success: (results, status, xhr) => {
          console.log('AJAX Sucessiful');
        },
        error: (xhr, status, error) => {
          console.error('AJAX Failed');
          console.error(xhr, status, error);        
        }
      });
    }
  });

});

