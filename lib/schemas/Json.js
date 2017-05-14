"use strict";

const Ajv = require("ajv");
const ajv = new Ajv();

class Json {

    static isValidSchema(schema){

        if(typeof schema !== "object"){
            return false;
        }

        try {
            const parsed = Json.parseSchema(schema);
            return !!parsed;
        } catch(e){
            return false;
        }
    }

    static parseSchema(schema){
        return ajv.compile(schema);
    }
}

module.exports = Json;