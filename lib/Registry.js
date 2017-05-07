"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const Promise = require("bluebird");

const subjectsRouter = require("./router/subjects.js");
const schemasRouter = require("./router/schemas.js");
const compatibilityRouter = require("./router/compatibility.js");
const configRouter = require("./router/config.js");

const Storage = require("./storage/Storage.js");
const Cache = require("./storage/Cache.js");

const AvroSchema = require("./schemas/Avro.js");
const JsonSchema = require("./schemas/Json.js");

const CONTENT_TYPE = "application/vnd.schemaregistry.v1+json";

class Registry {

    constructor({port = 12427, config = {}, kafka = {}}){

        this.port = port;
        this.config = config;
        this._server = null;

        this._storage = new Storage(kafka);
        this._cache = new Cache();
        this._app = this._init();
    }

    _init(){
        const app = express();

        app.use(bodyParser.json({
            type: req => req.headers["content-type"] &&
                req.headers["content-type"] === CONTENT_TYPE
        }));

        app.use("/subjects", subjectsRouter(this._storage, this._cache, this.config));
        app.use("/schemas", schemasRouter(this._storage, this._cache, this.config));
        app.use("/compatibility", compatibilityRouter(this._storage, this._cache, this.config));
        app.use("/config", configRouter(this._storage, this._cache, this.config));

        return app;
    }

    _listen(){
        return new Promise(resolve => {
            this._server = this._app.listen(this.port, () => {
                resolve();
            });
        });
    }

    _connect(){
        this._storage.on("message", this._cache.handleKafkaMessage.bind(this._cache));
        return this._storage.connect();
    }

    run(){
        return Promise.all([
            this._listen(),
            this._connect()
        ]);
    }

    close(){
        if(this._server){
            return this._server.close();
        }
    }
}

module.exports = Registry;