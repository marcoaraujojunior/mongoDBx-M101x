global.rootRequire = function(name) {
    return require(require('path').dirname(require.main.filename) + '/' + name);
}

var controllers = rootRequire('controllers/UserMenu');
var directives = rootRequire('directives/UserMenu');
var services = rootRequire('services/User');
var _ = require('underscore');

var app = angular.module('mean-retail', ['ng']);

_.each(controllers, function(controller, name) {
  app.controller(name, controller);
});

_.each(directives, function(directive, name) {
  app.directive(name, directive);
});

_.each(services, function(factory, name) {
  app.factory(name, factory);
});
