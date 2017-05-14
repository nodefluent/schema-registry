"use strict";

const assert = require("assert");

const {Registry, RegistryClient, LivingAvroSchema} = require("./../../index.js");
const config = require("./../test-config.js");

describe("Service Integration", function() {

    const isTravis = !!process.env.TEST_TOPIC;
    let server = null;
    let client = null;

    const testSchema = {
        type: "record",
        name: "test",
        fields: [
            {
                type: "string",
                name: "field1"
            }
        ]
    };

    const testSchema2 = {
        type: "record",
        name: "test",
        fields: [
            {
                type: "string",
                name: "field1"
            },
            {
                type: "int",
                name: "field2"
            }
        ]
    };

    const testSchema3 = {
        type: "record",
        name: "test",
        fields: [
            {
                type: "string",
                name: "field1"
            },
            {
                type: "int",
                name: "field2"
            },
            {
                type: "int",
                name: "field3"
            }
        ]
    };

    before(function(done){
        client = new RegistryClient(config.client);
        done();
    });

    after(function(done){
        server.close();
        done();
    });

    it("should be able to start registry", function () {
        config.registry.kafka.topic = process.env.TEST_TOPIC || config.registry.kafka.topic;
        server = new Registry(config.registry);
        return server.run();
    });

    it("should await the passing of a few milliseconds", function(done){
        setTimeout(done, 500);
    });

    /* ### before updates ### */

    let schemaId = null;
    let schemaVersion = null;

    it("should be able to create schema", function(){
        return client.registerSubjectVersion("test", testSchema)
            .then(result => {
                console.log(result);
                assert.equal(typeof result.id, "string");
                assert.equal(typeof result.version, "string");
                schemaId = result.id;
                schemaVersion = result.version;
                return true;
            });
    });

    it("should await the passing of a few milliseconds", function(done){
        setTimeout(done, 500);
    });

    it("should be able to create a second version for schema", function(){
        return client.registerSubjectVersion("test", testSchema2)
            .then(result => {
                console.log(result);
                return true;
            });
    });

    it("should await the passing of a few milliseconds", function(done){
        setTimeout(done, 500);
    });

    it("should be able to create a third version for schema", function(){
        return client.registerSubjectVersion("test", testSchema3)
            .then(result => {
                console.log(result);
                return true;
            });
    });

    it("should be able to update the global config", function(){
        return client.setConfig({someMore: "123"});
    });

    /* ### after updates ### */

    it("should await the passing of a few milliseconds", function(done){
        this.timeout(8000);
        setTimeout(done, !isTravis ? 1950 : 7950);
    });

    it("should be able to update the config of a subject", function(){
        return client.setSubjectConfig("test", {phenomenon: "wow"});
    });

    it("should be able to receive a list of versions for a topic", function(){
        return client.getVersionsForSubject("test");
    });

    it("should be able to receive updated config", function(){
        return client.getConfig().then(config => {
            assert.equal(config.someMore, "123");
            return true;
        });
    });

    it("should be able to receive config for subject", function(){
        return client.getSubjectConfig("test").then(config => {
            assert.equal(config.phenomenon, "wow");
            return true;
        });
    });

    it("should be able to get schema by id", function(){
        return client.getSchemaById(schemaId).then(schema => {
            console.log(schema);
            return true;
        });
    });

    it("should be able to get all subject names", function(){
        return client.getSubjects().then(names => {
            console.log(names);
            assert.equal(names.length, 1);
            return true;
        });
    });

    it("should be able to get a specific version of a subject", function(){
        return client.getSubjectSchemaForVersion("test", schemaVersion).then(schema => {
            console.log(schema);
            return true;
        });
    });

    it("should be able to get the latest version of a subject", function(){
        return client.getLatestSubjectSchema("test").then(schema => {
            console.log(schema);
            return true;
        });
    });

    it("should be able to check if a schema is already registered under a subject", function(){
        return client.checkSubjectRegistration("test", testSchema2).then(schema => {
            console.log(schema);
            return true;
        });
    });

    /* ### living schema ### */

    it("should be able to create, fetch and use a living schema", function(){

        const livingSchema = new LivingAvroSchema("test", "latest", config.client);

        let called = false;
        livingSchema.on("new-version", schema => {
            console.log(schema);
            called = true;
        });

        return livingSchema.fetch().then(_ => {

            const someObject = {
                field1: "bla",
                field2: 5,
                field3: 55
            };

            const buffer = livingSchema.toBuffer(someObject);
            const result = livingSchema.fromBuffer(buffer);
            console.log(buffer, result);

            assert.deepEqual(someObject, result);
            assert.equal(called, true);
            return true;
        });
    });
});