"use strict";

const assert = require("assert");

const {Registry, RegistryClient} = require("./../../index.js");
const config = require("./../test-config.json");

describe("Service Integration", function() {

    let server = null;
    let client = null;

    before(function(done){
        client = new RegistryClient(config.client);
        done();
    });

    after(function(done){
        server.close();
        done();
    });

    it("should be able to start registry", function () {
        server = new Registry(config.registry);
        return server.listen();
    });
});