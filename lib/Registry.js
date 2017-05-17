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
const {sendError} = require("./tools");

const CONTENT_TYPE = "application/vnd.schemaregistry.v1+json";
const SCHEMA_TYPE = "schema-registry-type";
const TYPES = ["avro", "json"];

class Registry {

    constructor({port = 12427, config = {}, kafka = {}, logger}) {

        this.port = port;
        this.config = config;
        this._server = null;
        this.logger = logger;
        this.isAlive = true;

        if(this.logger){
            this.logger.info(`Using schema topic: ${kafka.topic}.`);
        }

        this._storage = new Storage(kafka);
        this._cache = new Cache(logger);
        this._app = this._init();
    }

    _init(){
        const app = express();

        if(this.logger && this.logger.applyMiddlewareAccessLog){
            this.logger.applyMiddlewareAccessLog(app);
        }

        app.use(bodyParser.json({
            type: req => req.headers["content-type"] &&
                req.headers["content-type"] === CONTENT_TYPE
        }));

        app.use((req, res, next) => {

            if(!req.headers[SCHEMA_TYPE]){
                req.schemaType = TYPES[0];
                return next();
            }

            if(TYPES.indexOf(req.headers[SCHEMA_TYPE]) === -1){
                return sendError(res, 400, `${req.headers[SCHEMA_TYPE]} is not a supported type: ${TYPES.join(", ")}.`);
            }

            req.schemaType = req.headers[SCHEMA_TYPE];
            next();
        });

        app.use("/subjects", subjectsRouter(this._storage, this._cache, this));
        app.use("/schemas", schemasRouter(this._storage, this._cache, this));
        //TODO app.use("/compatibility", compatibilityRouter(this._storage, this._cache, this));
        app.use("/config", configRouter(this._storage, this._cache, this));

        app.get("/alive", (req, res) => {
            res.status(this.isAlive ? 200 : 503).json({});
        });

        app.use((error, req, res, _) => {

            if(this.logger){
                this.logger.error(error.message);
            }

            sendError(res, 500, `An internal error occurred: ${error.message}.`);
        });

        return app;
    }

    _listen(){
        return new Promise(resolve => {
            this._server = this._app.listen(this.port, () => {
                if(this.logger){
                    this.logger.info(`Listening @ http://0.0.0.0:${this.port}.`);
                }
                resolve();
            });
        });
    }

    _connect(){
        this._storage.on("message", this._cache.handleKafkaMessage.bind(this._cache));
        return this._storage.connect().then(_ => {
            if(this.logger){
                this.logger.info(`Connected to Kafka Broker.`);
            }
           return _;
        });
    }

    run(){
        return Promise.all([
            this._listen(),
            this._connect()
        ]);
    }

    getConfig(){
        return this.config;
    }

    updateConfig(config){

        this.config = Object.assign({}, this.config, config);

        if(this.logger){
            this.logger.info(`Global config has been updated.`);
        }
    }

    close(){
        if(this._server){
            return this._server.close();
        }
    }
}

module.exports = Registry;
