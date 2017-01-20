// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';


const ConnectionString = require('azure-iothub').ConnectionString;
const uuid = require('uuid');
 
const consoleLogLevel = "info";
const fileLogLevel = "debug";
const logFileName = "trace.log";
const testCommand = uuid.v4();
const pingUrl = 'www.microsoft.com';
const httpsRequestUrl = 'https://www.microsoft.com/';

module.exports = {
  consoleLogLevel: consoleLogLevel,
  fileLogLevel: fileLogLevel,
  logFileName: logFileName,
  pingUrl: pingUrl,
  testCommand: testCommand,
  httpsRequestUrl: httpsRequestUrl
};
