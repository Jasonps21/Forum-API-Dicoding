/* istanbul ignore file */
const Jwt = require('jsonwebtoken');
const pool = require('../src/Infrastructures/database/postgres/pool');
const UsersTableTestHelper = require('./UsersTableTestHelper');

const ServerTableTestHelper = {
  async getAccessToken() {
    const payloadUser = {
      id: 'user-123',
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };
    await UsersTableTestHelper.addUser(payloadUser);
    return Jwt.sign(payloadUser, process.env.ACCESS_TOKEN_KEY);
  },

  async getAccessTokenUser2() {
    const payloadUser = {
      id: 'user-456',
      username: 'jason_pratama',
      password: 'secret',
      fullname: 'Jason Pratama',
    };
    await UsersTableTestHelper.addUser(payloadUser);
    return Jwt.sign(payloadUser, process.env.ACCESS_TOKEN_KEY);
  },
};

module.exports = ServerTableTestHelper;
