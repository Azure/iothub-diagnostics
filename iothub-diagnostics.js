#!/usr/bin/env node
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict'

const logger = require('./lib').logger;
const async  = require('async');
const config = require('./config');
const ConnectionString = require('azure-iothub').ConnectionString;

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
        ConnectionString.parse(process.argv[2])
      }
      catch(exception) {
        logger.crit('Unable to parse the connection string, verify correctness: ' + exception);
        return done();  
      }

      require('./iothubtests').run(process.argv[2], done);
    }
  }
]);