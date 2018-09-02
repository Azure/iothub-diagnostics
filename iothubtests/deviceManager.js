// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict'

const logger = require('../lib').logger;
const iothub = require('azure-iothub');
const errors = require('azure-iot-common').errors;
const Registry = iothub.Registry;
const ConnectionString = require('azure-iothub').ConnectionString;

function getDevice(iotHubConnectionString, deviceId, done) {
  var registry = Registry.fromConnectionString(iotHubConnectionString);
  registry.get(deviceId, done);
}

function getDeviceConnectionString(iotHubConnectionString, deviceInfo) {
  var deviceConnectionString = 'HostName=' + ConnectionString.parse(iotHubConnectionString).HostName + ';DeviceId=' + deviceInfo.deviceId + ';SharedAccessKey=' + deviceInfo.authentication.symmetricKey.primaryKey;
  logger.trace('Connectionstring: ' + deviceConnectionString);
  return deviceConnectionString;
}

// Create a new device
function createDevice(iotHubConnectionString, deviceId, done) {
  var registry = Registry.fromConnectionString(iotHubConnectionString);
  var device = {
    deviceId: deviceId,
    status: 'enabled'
  };
  logger.trace("Creating device '" + device.deviceId + "'");

  registry.create(device, function(err, deviceInfo) {
    if (err) {
      logger.fatal('Unable to register device, error: ' + err.toString());
      return done(err);
    }

    logger.trace('Created device: ' + JSON.stringify(deviceInfo));

    return done(null, getDeviceConnectionString(iotHubConnectionString, deviceInfo));
  });
};

// Delete a device
function deleteDevice(iotHubConnectionString, deviceId, done) {
  var registry = Registry.fromConnectionString(iotHubConnectionString);
  registry.delete(deviceId, function(err, deviceInfo) {
    logger.trace('Deleted device ' + deviceId);
    return done(err);
  });
}

module.exports = {
  getDevice: getDevice,
  getDeviceConnectionString: getDeviceConnectionString,
  createDevice: createDevice,
  deleteDevice: deleteDevice
}
