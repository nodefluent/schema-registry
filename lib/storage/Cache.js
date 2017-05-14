"use strict";

const TYPE_SUBJECT = "subject";
const TYPE_CONFIG = "config";

class Cache {

    constructor(logger = {}){

        this.logger = logger;
        this.data = {
            subjects: {},
            configs: {}
        };
    }

    handleKafkaMessage(message){

        if(this.logger) {
            this.logger.debug(`Incoming kafka message: ${message.offset}.`);
        }

        try {
            const msg = JSON.parse(message.value);
            const payload = msg.payload;

            switch (payload.type) {

                case TYPE_CONFIG:
                    this._handleConfigPayload(msg, payload.data);
                    break;

                case TYPE_SUBJECT:
                    this._handleSubjectPayload(msg, payload.data);
                    break;

                default:
                    if (this.logger) {
                        this.logger.warn("Unknown kafka message payload type: " + payload.type);
                    }
                    break;
            }
        } catch(error){
            if (this.logger) {
                this.logger
                    .error(`Failed to handle kafka message: ${JSON.stringify(message)} with error: ${error.message}.`);
            }
        }
    }

    _handleSubjectPayload(msg, payload){

        if(!this.data.subjects[payload.name]){
            this.data.subjects[payload.name] = {};
        }

        if(msg.type.endsWith("-unpublished")){
            delete this.data.subjects[payload.name];
            return;
        }

        this.data.subjects[payload.name][payload.version] = {
            subject: payload.name,
            version: payload.version,
            config: payload.config,
            schemaId: payload.id,
            schemaString: payload.schema,
            altVersion: payload.altVersion,
            type: payload.type,
            createdAt: payload.createdAt
        };
    }

    _handleConfigPayload(msg, payload){
        this.data.configs[payload.subject] = payload.config;
    }

    getSchemaById(id){

        let schema = null;

        //TODO break maybe ;)?
        Object
            .keys(this.data.subjects)
            .map(key => this.data.subjects[key])
            .forEach(versions => {
                Object.keys(versions)
                    .map(vKey => versions[vKey])
                    .forEach(version => {
                         if(version.schemaId === id){
                             schema = version;
                         }
                    });
            });

        return schema;
    }

    getSubject(name){
        return this.data.subjects[name];
    }

    getSubjectNames(){
        return Object.keys(this.data.subjects);
    }

    getSchemaVersionsOfSubject(name){

        const subject = this.getSubject(name);
        if(!subject){
            return null;
        }

        return Object.keys(subject).map(v => v);
    }

    getSchemaVersionByMatch(name, schemaString){

        const subject = this.getSubject(name);
        if(!subject){
            return null;
        }

        //TODO break maybe ;)?
        let versionHit = null;
        Object
            .keys(subject)
            .map(key => subject[key])
            .forEach(version => {
                if(version.schemaString === schemaString){
                    versionHit = version;
                }
            });

        return versionHit;
    }

    getLatestSubjectVersion(name){

        const subject = this.getSubject(name);
        if(!subject){
            return null;
        }

        //identify by createdAt timestamp
        //as key order can change
        const versions = Object.keys(subject);

        let latestVersion = versions[0];
        let latestCreatedAt = subject[versions[0]].createdAt;

        let schema = null;
        for(let i = 0; i < versions.length; i++){
            schema = subject[versions[i]];
            if(schema.createdAt >= latestCreatedAt){
                latestVersion = versions[i];
                latestCreatedAt = schema.createdAt;
            }
        }

        return subject[latestVersion];
    }

    getConfig(name){
        return this.data.configs[name];
    }
}

module.exports = Cache;