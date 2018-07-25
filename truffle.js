// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {

    testrpc: {
         network_id: 201,
         host: "127.0.0.1",
         port: 8545
     },

    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*' // Match any network id
    }

  }

}
