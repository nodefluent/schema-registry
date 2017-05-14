"use strict";

const avro = require("avsc");

class Avro {

    static isValidSchema(schema){

        if(typeof schema !== "object"){
            return false;
        }

        try {
            const parsed = Avro.parseSchema(schema);
            return !!parsed;
        } catch(e){
            return false;
        }
    }

    static parseSchema(schema){
        return avro.Type.forSchema(schema);
    }
}

module.exports = Avro;