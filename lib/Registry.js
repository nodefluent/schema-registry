"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const Promise = require("bluebird");

const subjectsRouter = require("./router/subjects.js");
const schemasRouter = require("./router/schemas.js");
const compatibilityRouter = require("./router/compatibility.js");
const configRouter = require("./router/config.js");

const CONTENT_TYPE = "application/vnd.schemaregistry.v1+json";

class Registry {

    constructor({port, config}){

        this.port = port;
        this.config = config;
        this._server = null;

        this._app = this._init();
    }

    _init(){
        const app = express();

        app.use(bodyParser.json({
            type: req => req.headers["content-type"] &&
                req.headers["content-type"] === CONTENT_TYPE
        }));

        app.use("/subjects", subjectsRouter);
        app.use("/schemas", schemasRouter);
        app.use("/compatibility", compatibilityRouter);
        app.use("/config", configRouter);

        return app;
    }

    listen(){
        return new Promise(resolve => {
            this._server = this._app.listen(this.port, () => {
                resolve();
            });
        });
    }

    close(){
        if(this._server){
            return this._server.close();
        }
    }
}

module.exports = Registry;