"use strict";

const AvroSchema = require("./Avro.js");
const JsonSchema = require("./Json.js");

const getSchema = (req) => {
    switch(req.schemaType){
        case "avro": return AvroSchema;
        case "json": return JsonSchema;
        default: throw new Error("schemaType missing on request object.");
    }
};

module.exports = {
    AvroSchema,
    JsonSchema,
    getSchema
};