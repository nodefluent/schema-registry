"use strict";

class Cache {

    constructor(){
        this.data = {
            subjects: {}
        };
    }

    handleKafkaMessage(message){
        console.log(message.offset);
        const msg = JSON.parse(message.value);
        const payload = msg.payload;

        if(!this.data.subjects[payload.name]){
            this.data.subjects[payload.name] = {};
        }

        if(msg.type.endsWith("-unpublished")){
            delete this.data.subjects[payload.name];
            return;
        }

        this.data.subjects[payload.name][payload.version] = {
            config: payload.config,
            schemaId: payload.id,
            schemaString: payload.schema
        };
    }

    getSchema(id){

    }

    getSubject(name){
        return this.data.subjects[name];
    }

    getSchemaVersionsOfSubject(name){

        const subject = this.getSubject(name);
        if(!subject){
            return null;
        }

        return Object.keys(subject).map(v => parseInt(v));
    }
}

module.exports = Cache;