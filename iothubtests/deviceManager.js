'use strict'

const logger = require('../lib').logger;
const iothub = require('azure-iothub');
const Registry = iothub.Registry;
const Device = iothub.Device;
const ConnectionString = require('azure-iothub').ConnectionString;

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

    var deviceConnectionString = 'HostName=' + ConnectionString.parse(iotHubConnectionString).HostName + ';DeviceId=' + deviceInfo.deviceId + ';SharedAccessKey=' + deviceInfo.authentication.symmetricKey.primaryKey;
    logger.trace('Connectionstring: ' + deviceConnectionString);

    return done(null, deviceConnectionString);
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
  createDevice: createDevice,
  deleteDevice: deleteDevice
}
