'use strict';

const logger = require('../lib').logger;
const config = require('../config');
const dns = require('dns');
const https = require('https');
const ping = require('ping');

function httpsRequest(done) {
  logger.info('');
  logger.info("Sending https request to '" + config.httpsRequestUrl + "'");

  var req = https.get(config.httpsRequestUrl, (res) => {
    res.on('data', (d) =>
    {
        logger.info('--> Completed https request');
        return done(null);
    });
  });
  
  req.on('error', (e) => {
      logger.warn('--> Failed to make https request.');
      logger.debug(e);
      return done(e);
  });

  req.end();
}

function pingIpv4Address(ipv4Address, done) {
  logger.info('');
  logger.info("Pinging IPV4 address '" + ipv4Address + "'...");
  ping.sys.probe(ipv4Address, function(isAlive) {
    if (isAlive) {
      logger.info('--> Successfully pinged ' + ipv4Address);
      return httpsRequest(done);
    } else {
      logger.crit ('--> Failed to ping ' + ipv4Address);
    }
  });
}

function run(done) { 
  var domain = config.pingUrl;

  logger.info('');
  logger.info("Starting DNS resolution for host '" + domain + "'..." );
  dns.resolve4(domain, function(err, addresses) {
    if (err) {
       logger.crit("--> Failed to resolve host, error: " + err.code);
       return done(err);
    } else {
       logger.info('--> Successfully resolved DNS to ' + addresses[0] + '.' );
       logger.debug(JSON.stringify(domain) + ' using address: ' + addresses[0]);
       pingIpv4Address(addresses[0], done);
    }
  });
}

module.exports = {
  run: run
};