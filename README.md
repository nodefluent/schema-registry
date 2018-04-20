# node-schema-registry

[![Greenkeeper badge](https://badges.greenkeeper.io/nodefluent/schema-registry.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/nodefluent/schema-registry.svg?branch=master)](https://travis-ci.org/nodefluent/schema-registry)

> DISCLAIMER: We encourage you to keep your topics dynamic and JSON only, when choosing to go the Node.js Kafka way.
Therefore we are no longer adding features to this registry project. When you are looking for a typed (schema-requirement) approach we suggest using Confluent's schema-registry with AVRO.

- in BETA :seedling:
- avro & json schema registry backed by Kafka :octopus:
- API similar to [confluentinc's schema-registry](https://github.com/confluentinc/schema-registry)
- enhances the experience of [node-kafka-streams](https://github.com/nodefluent/kafka-streams)
- enables [node-kafka-connect](https://github.com/nodefluent/kafka-connect)
- might also be used in a Kafka unrelated field :star:
- ships with a neat `RegistryClient`
- checkout [API Quickstart](docs/api.md)
- compatibility options are currently disabled
- `LivingAvroSchema` and `LivingJsonSchema` allow for real-time schema updates
in running services

## What is a Schema Registry?

Schema Registry provides a serving layer for your metadata. It provides a
RESTful interface for storing and retrieving Avro schemas. It stores a versioned
history of all schemas, provides multiple compatibility settings and allows
evolution of schemas according to the configured compatibility setting. It
provides serializers that plug into Kafka clients that handle schema storage and
retrieval for Kafka messages that are sent in the Avro format.

## Code Wise (Dev)

```
npm install --save schema-registry
```

```es6
const {RegistryClient, Registry, LivingAvroSchema} = require("schema-registry");
const registryClient = new RegistryClient({port: 1337});
registryClient.getLatestSubjectSchema("test-subject").then(schema => {..});
```

## Living Schemas

```es6
const {LivingAvroSchema} = require("schema-registry");
const livingSchema = new LivingAvroSchema("test", "latest", {port: 1337});
livingSchema.on("new-version", console.log);
livingSchema.fetch().then(_ => {
    const buffer = livingSchema.toBuffer(someObject);
    const equalToSomeObject = livingSchema.fromBuffer(buffer);
});
```

## Run a Registry (Ops) (Quicksetup)

```
npm install -g schema-registry
```

```
# you will need zookeeper + kafka (checkout `/kafka-setup/start.sh`
# if you dont have them)
# node-schema-registry -h
node-schema-registry -p 1337 -z localhost:2181/ -t _node_schema -l info
```

## Using the registry CLI Client
```
nsrc --host localhost -p 1337 -e getSchemaById -a e707463d-0c3d-4010-afed-0d53c77e3605 -v
```
