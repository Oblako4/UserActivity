var assert = require('assert');
var expect = require('chai').expect;
const db = require('../database/index');

var testUser = {
  firstName: 'David',
  lastName: 'Ivanov',
  email: 'aviwdd13122@ivanov.com',
  phone: '6692370099',
  password: 'david6692370099'
};

describe('', function() {
  before(function(done) {
    done();
  });

  after(function(done) {
    done();
  });

  describe('Create user', function() {

    it('Should create a user', function(done) {
      db.createUser(testUser.firstName, testUser.lastName, testUser.email, testUser.phone, testUser.password)
        .then((result) => {
          return db.getUser(result.insertId);
        })
        .then((result) => {
          expect(result[0].first_name).to.equal(testUser.firstName);
          expect(result[0].last_name).to.equal(testUser.lastName);
          done();
        })
        .catch((error) => {
          return done(error);
        });
    });

  });

});