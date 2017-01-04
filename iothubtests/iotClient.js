'use strict';

const logger = require('../lib').logger;
const config = require('../config')
const iothub = require('azure-iothub');
const Message = require('azure-iot-device').Message;

var runTest = function(deviceConnectionString, protocol, deviceId, done) {
  var client = require('azure-iot-device').Client.fromConnectionString(deviceConnectionString, protocol);

  logger.trace('Opening the client.');
  
  // Connect to the service
  client.open(function (err) {
    if (err) {
      logger.fatal('Could not connect to IOT HUB: ' + err);
      return done(err);
    } else {
      logger.debug('Client connected, sending message');        

      // Listen for messages
      client.on('message', function (msg) {
        if(JSON.parse(msg.data) === config.testCommand) {
          client.complete(msg, function(err, res) {
            if (err) logger.crit('Error completing message: ' + err.toString());
            return client.close(done);
          });
        } else {
          logger.debug('Client received invalid command from service: ignoring');
        }
      });

      // on message asynchronously subscribes for messages, but doesnt give us a callback when its done.
      //  This impacts MQTT, because if the device has never subscribed then the service will drop any messages sent to it.
      //  So we need to wait a few seconds before we send the message to try and smooth that out.
      setTimeout(function() {
        // Send initial telemetry event
        var msg = new Message(deviceId);
        client.sendEvent(msg, function(err, res) {
          if(err) logger.crit('Error sending telemetry: ' + err);
          if(res) logger.debug('Telemetry sent, status: ' + res.constructor.name);
        });
      }, 3000);
    }
  });
}

module.exports.runTest = runTest;
