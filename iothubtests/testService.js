// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

const logger = require('../lib').logger;
const config = require('../config');
const EventHubClient = require('azure-event-hubs').Client;
const ServiceClient = require('azure-iothub').Client;
const Message = require('azure-iot-common').Message;
var serviceConnection = null;
var eventHubConnection = null;

// Called whenever an error occurs in either the message callback or the  eventhub connection setup
function errorCb(err) {
  logger.crit(err.message);
};

// Called whenever we receive a telemetry message from the client
function messageReceivedCb(message) {
  logger.debug('Service successfully received telemetry from client.');
  logger.trace(JSON.stringify(message));
  var targetDevice = message.body;

  if(!targetDevice) {
    logger.crit('Client telemetry message did not contain the device, unable to respond.');
  } else {
    serviceConnection.send(targetDevice, JSON.stringify(config.testCommand), function(err, res) {
          if(err) logger.crit("Error sending command: " + err);
          if(res) logger.debug("Command sent, status = " + res.constructor.name);
      });
  }
};

// Called to start the service
function open(iothubConnectionString, ready) {
  if(serviceConnection || eventHubConnection) close();

  serviceConnection = ServiceClient.fromConnectionString(iothubConnectionString);
  eventHubConnection = EventHubClient.fromConnectionString(iothubConnectionString);

  serviceConnection.open(function(err) {
    if (err) {
      logger.fatal('Unable to open connection to Eventhub: ' + err.message);
      return;
    }

    logger.trace('Test service open.');
    eventHubConnection.open()
      .then(eventHubConnection.getPartitionIds.bind(eventHubConnection))
      .then(function (partitionIds) {
        return partitionIds.map(function (partitionId) {
          return eventHubConnection.createReceiver('$Default', partitionId, { 'startAfterTime' : Date.now()}).then(function(receiver) {
            logger.trace('Created partition receiver: ' + partitionId)
            receiver.on('errorReceived', errorCb);
            receiver.on('message', messageReceivedCb);
            });
        });
      })
      .then(function() { ready() })
      .catch(errorCb);
  });
};

// Closes the connection to the eventhub and to the DeviceClient.
function close() {
  if(eventHubConnection) {
    eventHubConnection.close();
    eventHubConnection = null;
  }

  if(serviceConnection) { 
    serviceConnection.close(function(err) {});
    serviceConnection = null;
  }
}

module.exports = {
  open: open,
  close: close
};
