"use strict";

const uuid = require("uuid");
const EventEmitter = require("events");
const {Kafka, Drainer, Publisher} = require("sinek");
const Promise = require("bluebird");

const DEFAULT_TOPIC = "_schemas";

const DEFAULT_LOGGER = {
    debug: msg => {},
    info: msg => {},
    warn: msg => {},
    error: msg => {}
};

const DEFAULT_OPTIONS = {
    zkConStr: "localhost:2181/",
    logger: null,
    groupId: "schema-registry",
    clientName: "schema-registry",
    partitions: 1,
    workerPerPartition: 1,
    options: {
        sessionTimeout: 8000,
        protocol: ["roundrobin"],
        fromOffset: "earliest",
        fetchMaxBytes: 1024 * 100,
        fetchMinBytes: 1,
        fetchMaxWaitMs: 10,
        heartbeatInterval: 250,
        retryMinTimeout: 250,
        autoCommit: true,
        requireAcks: 1,
        ackTimeoutMs: 100,
        partitionerType: 3
    }
};

const VERSION = 1;
const COMPRESSION_TYPE = 0;

class Storage extends EventEmitter {

    constructor({topic, options, logger}){
        super();

        this.topic = topic || DEFAULT_TOPIC;
        this.options = options || DEFAULT_OPTIONS;
        this.options.logger = logger || DEFAULT_LOGGER;

        this.options.groupId += "-" + uuid.v4();
        this.options.clientName += "-" + uuid.v4();

        this.consumerClient = null;
        this.producerClient = null;

        this.drainer = null;
        this.publisher = null;

        this.connected = false;
    }

    _onError(error){
        super.emit("error", error);
    }

    connect(){

        if(this.connected){
            return Promise.reject("already connected.");
        }

        return new Promise(resolve => {

            const {zkConStr, logger, groupId, clientName,
                options, partitions, workerPerPartition} = this.options;

            this.consumerClient = new Kafka(zkConStr, logger);
            this.producerClient = new Kafka(zkConStr, logger);

            this.consumerClient.on("error", this._onError.bind(this));
            this.producerClient.on("error", this._onError.bind(this));

            //await both connections
            let readyCount = 0;

            const readyCallback = () => {
                readyCount++;
                if(readyCount === 2){
                    this.connected = true;
                    resolve();
                }
            };

            this.consumerClient.on("ready", readyCallback);
            this.producerClient.on("ready", readyCallback);

            this.consumerClient.becomeConsumer([this.topic], groupId, options || {});
            this.producerClient.becomeProducer([this.topic], clientName, options || {});

            this.drainer = new Drainer(this.consumerClient, workerPerPartition, false, true);
            this.publisher = new Publisher(this.producerClient, partitions || 1);

            this.drainer.drain((message, done) => {
                super.emit("message", message);
                done();
            });
        });
    }

    create(payload){

        if(!this.publisher){
            return super.emit("error", "publisher not ready, did you call connect?");
        }

        return this.publisher
            .bufferPublishMessage(this.topic, uuid.v4(), payload, VERSION, COMPRESSION_TYPE);
    }

    update(payload){

        if(!this.publisher){
            return super.emit("error", "publisher not ready, did you call connect?");
        }

        return this.publisher
            .bufferUpdateMessage(this.topic, uuid.v4(), payload, VERSION, COMPRESSION_TYPE);
    }

    remove(payload){

        if(!this.publisher){
            return super.emit("error", "publisher not ready, did you call connect?");
        }

        return this.publisher
            .bufferUnpublishMessage(this.topic, uuid.v4(), payload, VERSION, COMPRESSION_TYPE);
    }

    close(){

        this.connected = false;

        if(this.drainer){
            this.drainer.close(false);
        }

        if(this.publisher){
            this.publisher.close();
        }
    }

}

module.exports = Storage;