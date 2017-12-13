'use strict';

const bunyan = require('bunyan');
const config = require('config');

module.exports = {
  getLog: (filename) => {
    return bunyan.createLogger({
      name: filename,
      streams: [
        {
          path: config.get('logger.path'),
          level: config.get('logger.level'),
          period: config.get('logger.period'),
          count: config.get('logger.count'),
        },
        {
          stream: process.stdout,
          level: config.get('logger.level'),
        },
      ],
    });
  },
};

//In Script einfugen:  const log = require('./logger/logger.js').getlog('scriptname');

/** Log Level
 *
 "fatal" (60): The service/app is going to stop or become unusable now. An operator should definitely look into this soon.
 "error" (50): Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon(ish).
 "warn" (40): A note on something that should probably be looked at by an operator eventually.
 "info" (30): Detail on regular operation.
 "debug" (20): Anything else, i.e. too verbose to be included in "info" level.
 "trace" (10): Logging from external libraries used by your app or very detailed application logging.


 Error-Logging
 Bsp.: log.error({err: err}, "oops! wtf has happened? ")
 */
