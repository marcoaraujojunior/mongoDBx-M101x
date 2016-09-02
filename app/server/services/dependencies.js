var fs = require('fs');
var fx = rootRequire('services/fx');
var Stripe = require('stripe');
var Config = rootRequire('config/config');

module.exports = function(wagner) {
  var stripe =

  // TODO: Make Stripe depend on the Config service and use its `stripeKey`
  // property to get the Stripe API key.
  wagner.factory('Stripe', function() {
    return Stripe(Config.stripeKey);
  });

  wagner.factory('fx', fx);

  wagner.factory('Config', function() {
    return Config;
    return JSON.parse(fs.readFileSync('./config.json').toString());
  });
};
