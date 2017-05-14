#!/usr/bin/env node

const program = require("commander");
const Logger = require("log4bro");

const {Registry} = require("./../index.js");
const config = require("./../config/default.json");
const pjson = require("./../package.json");

program
    .version(pjson.version)
    .option("-p, --port [int]", "Registry Port")
    .option("-z, --zookeeper [string]", "Zookeeper Connection String")
    .option("-t, --topic [string]", "Kafka Topic")
    .option("-l, --loglevel [string]", "LogLevel (debug,info,warn,error)")
    .parse(process.argv);

if(program.port){
    config.port = program.port;
}

if(program.zookeeper){
    config.kafka.options.zkConStr = program.zookeeper;
}

if(program.topic){
    config.kafka.topic = program.topic;
}

if(program.loglevel){
    config.logger.level = program.loglevel.toUpperCase();
}

if(config.logger){
    config.logger = new Logger(config.logger);
}

const registry = new Registry(config);
registry.run();