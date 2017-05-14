"use strict";

const Ajv = require("ajv");

const RegistryClient = require("./RegistryClient.js");

class LivingJsonSchema extends RegistryClient {

    constructor(config){
        super(config);
        this.ajv = new Ajv();
        //TODO implement living-json-schema
    }

}

module.exports = LivingJsonSchema;