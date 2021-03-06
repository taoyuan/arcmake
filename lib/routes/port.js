'use strict';

var co = require('co');
var _ = require('lodash');
var Promise = require('bluebird');
var sp = Promise.promisifyAll(require('serialport'));

module.exports = function (app, arduino, handler) {
  return function () {
    app.insight.track('iotor', 'board');

    var current = arduino.context.get('serial.port');
    return {
      message: 'Select a serial port:',
      default: current,
      choices: function () {
        return sp.listAsync().then(function (ports) {
          return _.filter(ports, function (port) {
            return port.vendorId && port.productId;
          });
        }).then(function (ports) {
          return _.map(ports, function (port) {
            var name = port.comName;
            if (_.startsWith(name, '/dev/')) {
              name = name.substring(5);
            }
            return [name, selectPort(name)];
          });
        }).then(function (ports) {
          if (ports.length) {
            return ports;
          }
          return [['No Serial Port found!', function () {
            return 'home';
          }]];
        });
      }
    }
  };

  function selectPort(port) {
    return function () {
      if (handler) {
        return handler(port)
      }
      return 'home';
    }
  }
};
