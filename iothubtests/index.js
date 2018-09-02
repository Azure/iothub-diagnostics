// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict'

const logger = require('../lib').logger;
const iotClient = require('./iotClient');
const deviceManager = require('./deviceManager');
const testService = require('./testService');
const async  = require('async');
const errors = require('azure-iot-common').errors;

function runTest(deviceConnectionString, protocol, label, done) {
  logger.info('');
  logger.info('Starting ' + label + ' Test...');
  iotClient.runTest(deviceConnectionString, protocol, function(err) {
    if(err) {
      logger.crit('--> Failed to run ' + label + ' test, error: ' + err);
    } else {
      logger.info('--> Successfully ran ' + label + ' test.');
    }

    // Don't pass out error (if the test completed, it will just state it failed, but still run the next test)
    return done(null, deviceConnectionString);
  });
}

function amqpTest(deviceConnectionString, done) {
  runTest(deviceConnectionString, require('azure-iot-device-amqp').Amqp, 'AMQP', done);
}

function amqpWsTest(deviceConnectionString, done) {
  runTest(deviceConnectionString, require('azure-iot-device-amqp').AmqpWs, 'AMQP/WS', done);
}

function httpTest(deviceConnectionString, done) {
  runTest(deviceConnectionString, require('azure-iot-device-http').Http, 'HTTPS', done);
}

function mqttTest(deviceConnectionString, done) {
  runTest(deviceConnectionString, require('azure-iot-device-mqtt').Mqtt, 'MQTT', done);
}

function mqttWsTest(deviceConnectionString, done) {
  runTest(deviceConnectionString, require('azure-iot-device-mqtt').MqttWs, 'MQTT/WS', done);
}

function run(iotHubConnectionString, consumerGroup, existingDeviceId, done) {
  var testDeviceId = existingDeviceId || 'iothub-diagnostics-' + require('uuid').v4();
  var preExistingDevice = false;
  async.waterfall([
      // Step 1, start event hub reader
      function(callback) {
        logger.trace('Starting test service.');
        testService.open(iotHubConnectionString, consumerGroup || '$Default', callback);
      },
      // Step 2, get/create the device
      function(callback) {
        logger.trace('Test device: ' + testDeviceId);
        deviceManager.getDevice(iotHubConnectionString, testDeviceId, function (err, deviceInfo) {
          if (err) {
            if (err instanceof errors.DeviceNotFoundError) {
              deviceManager.createDevice(iotHubConnectionString, testDeviceId, callback);
            } else {
              logger.fatal('Unable to query registry for device info: ' + err.toString());
              return done(err);
            }
          } else {
            preExistingDevice = true;
            logger.info('found test device on the hub');
            logger.trace(JSON.stringify(deviceInfo, null, 2));
            if (deviceInfo.status === 'disabled') {
              logger.fatal('device identity is disabled: it will not be able to connect');
              return done(new Error('Device is disabled'));
            } else if (deviceInfo.connectionState === 'Connected') {
              logger.fatal('device is already connected - aborting');
              return done(new Error('Device is already connected'));
            } else {
              callback(null, deviceManager.getDeviceConnectionString(iotHubConnectionString, deviceInfo));
            }
          }
        });
      },
      // Step 3, run the tests
      amqpTest,
      amqpWsTest,
      httpTest,
      mqttTest,
      mqttWsTest,
      // Step 4, cleanup
      function(deviceConnectionString, callback) {
        // deviceConnectionString is passed from the previous test but ignored since not needed here.
        logger.trace('Closing service connections');
        testService.close();
        if (preExistingDevice) {
          callback();
        } else {
          logger.trace('Removing temporary test device identity');
          deviceManager.deleteDevice(iotHubConnectionString, testDeviceId, callback);
        }
      }
    ],
    done);
};

module.exports = {
  run: run
};
