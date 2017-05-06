"use strict";

const request = require("request");
const Promise = require("bluebird");

class RegistryClient {

    constructor({protocol, host, port}){
        this.protocol = protocol;
        this.host = host;
        this.port = port;
    }

    _getBaseUrl(){
        return this.protocol + "://" + this.host + ":" + this.port + "/";
    }



}

module.exports = RegistryClient;