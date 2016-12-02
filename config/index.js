'use strict';


const ConnectionString = require('azure-iothub').ConnectionString;
 
const consoleLogLevel = "info";
const fileLogLevel = "debug";
const logFileName = "trace.log";
const testCommand = 'Terminate yourself';
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
