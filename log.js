const { LOG_LEVEL_NODE, LOG_LEVEL_BROWSER } = process.env;

export const getLog = (context) => {

  if (process.env.BROWSER) {

    const clogy = require('clogy');

    const levelMap = {
      ALL: 'log',
      TRACE: 'trace',
      DEBUG: 'debug',
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error',
      FATAL: 'error',
      MARK: 'error',
      OFF: 'none'
    };

    clogy.setLevel(levelMap[LOG_LEVEL_BROWSER]);

    const logger = clogy.noConflict();

    const prefixed = (func, args) => {
      logger.setOptions({
        prefix: `${context}:`
      });
      func.bind(logger)(...args);
    };

    return {
      log: (...args) => prefixed(logger.log, args),
      trace: (...args) => prefixed(logger.trace, args),
      debug: (...args) => prefixed(logger.debug, args),
      info: (...args) => prefixed(logger.info, args),
      warn: (...args) => prefixed(logger.warn, args),
      error: (...args) => prefixed(logger.error, args),
    };

  } else {

    const log4js = require('log4js');
    const log = log4js.getLogger(context);
    log.level = LOG_LEVEL_NODE;
    return log;

  }


};

export const graphLog = (request, name, values) => {

  let line = 'graphql-request=' + name;

  if (request.user) {
    line += ' user=' + request.user.uuid;
  } else {
    line += ' user=null';
  }

  if (values) {
    line += ' ' + values;
  }

  return line;

};


export default getLog('default');
