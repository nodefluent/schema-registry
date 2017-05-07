"use strict";

const request = require("request");
const Promise = require("bluebird");

const CONTENT_TYPE = "application/vnd.schemaregistry.v1+json";

class RegistryClient {

    constructor({protocol, host, port}){
        this.protocol = protocol;
        this.host = host;
        this.port = port;
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
                "content-type": CONTENT_TYPE
            }
        };
    }

    request(options, expectedStatusCode){
        return new Promise((resolve, reject) => {

            console.log(options); //TODO remove

            request(options, (error, response, body) => {

                if(error){
                    return reject(error);
                }

                console.log(body); //TODO remove

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
}

module.exports = RegistryClient;