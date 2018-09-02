#!/usr/bin/env node
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict'

const logger = require('./lib').logger;
const async  = require('async');
const ConnectionString = require('azure-iothub').ConnectionString;
const argv = require('yargs')
.usage('$0 [hub connection string]')
.alias('d', 'device')
.describe('device', 'use the specified device id (Symmetric Key authentication only)')
.alias('h', 'help')
.help('h')
.alias('g', 'consumerGroup')
.describe('consumerGroup', 'consumer group to use on the Event-hubs compatible endpoint')
.demandCommand(1)
.argv;

logger.info('*******************************************')
logger.info('* Executing the Microsoft IOT Trace tool. *');
logger.info('*******************************************')

async.series([
  function(done) {
    logger.info('');
    logger.info('--- Executing network tests ---');
    require('./networktests').run(done);
  },
  function(done) {
    logger.info('');
    logger.info('--- Executing IOT Hub tests ---');

    if(process.argv.length <= 2) {
      logger.crit('Skipping IotHub tests because no IotHub configuration provided. To verify connectivity to an IotHub provide the connection string on the command line.');
      return done();
    } else {
      try {
        ConnectionString.parse(argv._[0])
      }
      catch(exception) {
        logger.crit('Unable to parse the connection string, verify correctness: ' + exception);
        return done();
      }

      require('./iothubtests').run(argv._[0], argv.consumerGroup, argv.device, done);
    }
  }
], function () {
  process.exit(0);
});