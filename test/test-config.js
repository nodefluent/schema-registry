"use strict";

const Logger = require("log4bro");

const loggerOptions = {
    "productionMode": false,
    "logDir": "logs",
    "skipEnhance": true,
    "namespace": "",
    "silence": false,
    "loggerName": "dev",
    "dockerMode": false,
    "varKey": "LOG",
    "level": "DEBUG",
    "serviceName": "node-schema-registry"
};

const logger = new Logger(loggerOptions);

module.exports = {
  "registry": {
    logger,
    "port": 12426,
    "config": {},
    "kafka": {
        "topic": "_tschema"
    }
  },
  "client": {
    "protocol": "http",
    "host": "localhost",
    "port": 12426,
    logger
  }
};