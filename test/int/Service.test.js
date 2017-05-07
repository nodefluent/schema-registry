"use strict";

const assert = require("assert");

const {Registry, RegistryClient} = require("./../../index.js");
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
            },
            {
                type: "int",
                name: "field2"
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

    it("should be able to create schema", function(){
        return client.registerSubjectVersion("test", testSchema);
    });

    it("should await the passing of a few milliseconds", function(done){
        this.timeout(8000);
        setTimeout(done, !isTravis ? 1950 : 8000);
    });

    it("should be able to receive a list of versions for a topic", function(){
        return client.getVersionsForSubject("test");
    });
});