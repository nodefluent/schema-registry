# node-schema-registry

[![Greenkeeper badge](https://badges.greenkeeper.io/nodefluent/schema-registry.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/nodefluent/schema-registry.svg?branch=master)](https://travis-ci.org/nodefluent/schema-registry)

- in BETA :seedling:
- avro & json schema registry backed by Kafka :octopus:
- API similar to [confluentinc's schema-registry](https://github.com/confluentinc/schema-registry)
- enhances the experience of [kafka-streams](https://github.com/nodefluent/kafka-streams)
- might also be used in a Kafka unrelated field :star:
- ships with a neat `RegistryClient`
- checkout [API Quickstart](docs/api.md)


```
npm install --save schema-registry
```

```es6
const {RegistryClient, Registry} = require("schema-registry");
```

Schema Registry
================

Schema Registry provides a serving layer for your metadata. It provides a
RESTful interface for storing and retrieving Avro schemas. It stores a versioned
history of all schemas, provides multiple compatibility settings and allows
evolution of schemas according to the configured compatibility setting. It
provides serializers that plug into Kafka clients that handle schema storage and
retrieval for Kafka messages that are sent in the Avro format.