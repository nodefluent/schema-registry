# node-schema-registry

[![Greenkeeper badge](https://badges.greenkeeper.io/nodefluent/schema-registry.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/nodefluent/schema-registry.svg?branch=master)](https://travis-ci.org/krystianity/schema-registry)

- still WIP :seedling:
- json & avro schema registry backed by Kafka :octopus:
- similar to [confluentinc's schema-registry](https://github.com/confluentinc/schema-registry)
- enhances the experience of [kafka-streams](https://github.com/nodefluent/kafka-streams)
- might also be used in a Kafka unrelated field :star:


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

Quickstart
----------

The following assumes you have Kafka and an instance of the Schema Registry running using the default settings.

    # Register a new version of a schema under the subject "Kafka-key"
    $ curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
        --data '{"schema": "{\"type\": \"string\"}"}' \
        http://localhost:8081/subjects/Kafka-key/versions
      {"id":1}

    # Register a new version of a schema under the subject "Kafka-value"
    $ curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
        --data '{"schema": "{\"type\": \"string\"}"}' \
         http://localhost:8081/subjects/Kafka-value/versions
      {"id":1}

    # List all subjects
    $ curl -X GET http://localhost:8081/subjects
      ["Kafka-value","Kafka-key"]

    # List all schema versions registered under the subject "Kafka-value"
    $ curl -X GET http://localhost:8081/subjects/Kafka-value/versions
      [1]

    # Fetch a schema by globally unique id 1
    $ curl -X GET http://localhost:8081/schemas/ids/1
      {"schema":"\"string\""}

    # Fetch version 1 of the schema registered under subject "Kafka-value"
    $ curl -X GET http://localhost:8081/subjects/Kafka-value/versions/1
      {"subject":"Kafka-value","version":1,"id":1,"schema":"\"string\""}

    # Fetch the most recently registered schema under subject "Kafka-value"
    $ curl -X GET http://localhost:8081/subjects/Kafka-value/versions/latest
      {"subject":"Kafka-value","version":1,"id":1,"schema":"\"string\""}

    # Check whether a schema has been registered under subject "Kafka-key"
    $ curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
        --data '{"schema": "{\"type\": \"string\"}"}' \
        http://localhost:8081/subjects/Kafka-key
      {"subject":"Kafka-key","version":1,"id":1,"schema":"\"string\""}

    # Test compatibility of a schema with the latest schema under subject "Kafka-value"
    $ curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
        --data '{"schema": "{\"type\": \"string\"}"}' \
        http://localhost:8081/compatibility/subjects/Kafka-value/versions/latest
      {"is_compatible":true}

    # Get top level config
    $ curl -X GET http://localhost:8081/config
      {"compatibilityLevel":"BACKWARD"}

    # Update compatibility requirements globally
    $ curl -X PUT -H "Content-Type: application/vnd.schemaregistry.v1+json" \
        --data '{"compatibility": "NONE"}' \
        http://localhost:8081/config
      {"compatibility":"NONE"}

    # Update compatibility requirements under the subject "Kafka-value"
    $ curl -X PUT -H "Content-Type: application/vnd.schemaregistry.v1+json" \
        --data '{"compatibility": "BACKWARD"}' \
        http://localhost:8081/config/Kafka-value
      {"compatibility":"BACKWARD"}
