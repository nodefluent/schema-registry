"use strict";

const request = require("request");
const Promise = require("bluebird");

const CONTENT_TYPE = "application/vnd.schemaregistry.v1+json";
const SCHEMA_TYPE = "schema-registry-type";
const TYPES = ["avro", "json"];

class RegistryClient {

    constructor({protocol, host, port, logger = {}, type = "avro"}){
        this.protocol = protocol;
        this.host = host;
        this.port = port;
        this.logger = logger;

        if(TYPES.indexOf(type) === -1){
            throw new Error(`${type} is not a supported type: ${TYPES.join(", ")}.`);
        }

        this.type = type;
    }

    _getBaseUrl(){
        return this.protocol + "://" + this.host + ":" + this.port;
    }

    _getOptions(path = "/", method = "GET"){
        return {
            url: this._getBaseUrl() + path,
            method,
            headers: {
                "accept": "application/json",
                "content-type": CONTENT_TYPE,
                [SCHEMA_TYPE]: this.type
            }
        };
    }

    request(options, expectedStatusCode){
        return new Promise((resolve, reject) => {

            if(this.logger){
                this.logger.info(`Calling ${options.method} to ${options.url}.`);
            }

            request(options, (error, response, body) => {

                if(error){
                    this.logger.error(`An error occured ${error.message}.`);
                    return reject(error);
                }

                if(this.logger){
                    this.logger.info(`Received ${response.statusCode} for ${options.method}:${options.url}.`);
                }

                if(!expectedStatusCode || response.statusCode === expectedStatusCode){
                    return resolve(JSON.parse(body));
                }

                reject(new Error(`bad statusCode: ${response.statusCode}, ${body}.`));
            });
        });
    }

    registerSubjectVersion(subject, schema){
        //per confluent schema-registry api definition the schema is send as string
        schema = JSON.stringify(schema);
        const options = this._getOptions(`/subjects/${subject}/versions`, "POST");
        options.body = JSON.stringify({schema});
        return this.request(options, 200);
    }

    getVersionsForSubject(subject){
        const options = this._getOptions(`/subjects/${subject}/versions`);
        return this.request(options, 200);
    }

    getConfig(){
        const options = this._getOptions(`/config`);
        return this.request(options, 200);
    }

    setConfig(config){
        const options = this._getOptions(`/config`, "PUT");
        options.body = JSON.stringify({config});
        return this.request(options, 200);
    }

    setSubjectConfig(subject, config){
        const options = this._getOptions(`/config/${subject}`, "PUT");
        options.body = JSON.stringify({config});
        return this.request(options, 200);
    }

    getSubjectConfig(subject){
        const options = this._getOptions(`/config/${subject}`);
        return this.request(options, 200);
    }

    getSchemaById(id){
        const options = this._getOptions(`/schemas/ids/${id}`);
        return this.request(options, 200);
    }

    getSubjects(){
        return this.request(this._getOptions(`/subjects/`), 200);
    }

    getSubjectSchemaForVersion(subject, version){
        const options = this._getOptions(`/subjects/${subject}/versions/${version}`);
        return this.request(options, 200);
    }

    getLatestSubjectSchema(subject){
        const options = this._getOptions(`/subjects/${subject}/versions/latest`);
        return this.request(options, 200);
    }

    checkSubjectRegistration(subject, schema){
        //per confluent schema-registry api definition the schema is send as string
        schema = JSON.stringify(schema);
        const options = this._getOptions(`/subjects/${subject}`, "POST");
        options.body = JSON.stringify({schema});
        return this.request(options, 200);
    }
}

module.exports = RegistryClient;