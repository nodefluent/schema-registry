"use strict";

const avro = require("avsc");
const EventEmitter = require("events");

const RegistryClient = require("./RegistryClient.js");

const DEFAULT_POLL_INTERVALL = 10000;

class LivingAvroSchema extends RegistryClient {

    constructor(subject, version = "latest", config){
        super(config);

        this.subject = subject;
        this.version = version;
        this._ee = new EventEmitter();

        this.pollInterval = DEFAULT_POLL_INTERVALL;
        this._compiled = null;
        this._intv = null;
        this.lastVersion = null;
    }

    _emit(...args){
        this._ee.emit(...args);
    }

    _fetch() {
        return super.getSubjectSchemaForVersion(this.subject, this.version);
    }

    _adjustCompiledType(schema){

        if(this.lastVersion === schema.version){
            return;
        }

        const compiled = avro.Type.forSchema(JSON.parse(schema.schema));
        if(!compiled){
            return this._emit("error", "failed to parse registry schema: empty.")
        }

        this.lastVersion = schema.version;
        this._compiled = compiled;
        this._emit("new-version", schema);
    }

    on(...args) {
        this._ee.on(...args);
    }

    removeListener(...args){
        this._ee.removeListener(...args);
    }

    fetch(poll = false){

        if(poll) {
            this._intv = setInterval(() => {
                this._fetch().then(schema => {
                    this._adjustCompiledType(schema);
                }).catch(error => {
                    this._emit("error", error);
                });
            }, this.pollInterval);
        }

        return this._fetch().then(schema => {
            this._adjustCompiledType(schema);
            return true;
        });
    }

    stop(){
        if(this._intv){
            clearInterval(this._intv);
        }
    }

    toBuffer(object){

        if(!this._compiled){
            throw new Error("type is missing, have you called fetch() yet?");
        }

        return this._compiled.toBuffer(object);
    }

    fromBuffer(buffer){

        if(!this._compiled){
            throw new Error("type is missing, have you called fetch() yet?");
        }

        return this._compiled.fromBuffer(buffer);
    }
}

module.exports = LivingAvroSchema;