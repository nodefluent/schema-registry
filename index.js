"use strict";

const Registry = require("./lib/Registry.js");
const RegistryClient = require("./lib/client/RegistryClient.js");
const LivingAvroSchema = require("./lib/client/LivingAvroSchema.js");
const LivingJsonSchema = require("./lib/client/LivingJsonSchema.js");

module.exports = {
    Registry,
    RegistryClient,
    LivingAvroSchema,
    LivingJsonSchema
};