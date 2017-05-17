#!/usr/bin/env node

const program = require("commander");
const Logger = require("log4bro");

const {RegistryClient} = require("./../index.js");
const config = require("./../config/default.json");
const pjson = require("./../package.json");

function getFunctionsOfObject(constructor, except = []){
    return Object.getOwnPropertyNames(constructor).filter(function (p) {
        return typeof constructor[p] === "function" && except.indexOf(p) === -1;
    });
}

function parseIfPossible(str){

    try {
        const parsed = JSON.parse(str);
        if(parsed && typeof parsed === "object"){
            return parsed;
        }
    } catch(error){
        //empty
    }

    return str;
}

function collect(val, array) {
    array.push(parseIfPossible(val.trim()));
    return array;
}

program
    .version(pjson.version)
    .option("-h, --host [string]", "Registry Host")
    .option("-p, --port [int]", "Registry Port")
    .option("-t, --protocol [string]", "Registry Protocol")
    .option("-l, --loglevel [string]", "LogLevel (debug,info,warn,error)")
    .option("-e, --exec [string]", "Action to execute e,g, getSubjects")
    .option("-a, --arg [value]", "Parameters to be passed to action (repeatable)", collect, [])
    .option("-v, --verbose", "Show logs")
    .parse(process.argv);

if(program.port){
    config.port = program.port;
}

if(program.host){
    config.port = program.host;
}

if(program.protocol){
    config.port = program.protocol
}

if(program.loglevel){
    config.logger.level = program.loglevel.toUpperCase();
}

if(!program.verbose){
    config.logger = null;
}

if(config.logger){
    config.logger.dockerMode = false;
    config.logger = new Logger(config.logger);
}

const client = new RegistryClient(config);
const action = program.exec || "isAlive";

if(!client[action]){
    return console.log(`${action} is not a supported action of ${getFunctionsOfObject(RegistryClient.prototype, ["_getOptions", "_getBaseUrl"]).join(", ")}.`);
}

client[action]
    .apply(client, program.arg || [])
    .then(console.log)
    .catch(error => console.log(error.message));
