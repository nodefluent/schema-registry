"use strict";

const express = require("express");
const uuid = require("uuid");

const {getSchema} = require("../schemas");
const {readBodyField, sendError} = require("../tools");

module.exports = function(storage, cache, registry){

    const router = express.Router();

    /**
     * list all subjects
     */
    router.get("/", (req, res) => {
        //TODO returns array
    });

    /**
     * checks if a schema has been registered under a subject
     */
    router.post("/:subject", (req, res) => {
        //TODO returns full schema + subject
    });

    /**
     * delete all schema versions under a subject
     */
    router.delete("/:subject", (req, res) => {

        const subject = req.params.subject;
        if(!cache.getSubject(subject)){
            return sendError(res, 404, "subject does not exist");
        }

        storage.removeSubject({name: subject}).then(_ => {
            res.status(204).end();
        }, e => {
            sendError(res, 500, e.message);
        });
    });

    /**
     * register a new version under a subject
     */
    router.post("/:subject/versions", (req, res) => {

        let schema = readBodyField(req, res, "schema");
        if(schema === false){
            return;
        }

        try {
            //comes as string
            schema = JSON.parse(schema);
        } catch(e){
            return res.status(400).json({error: "schema must be a valid json string"});
        }

        if(!getSchema(req).isValidSchema(schema)){
            return res.status(400).json({error: "invalid schema"});
        }

        const subject = req.params.subject;

        const id = uuid.v4();
        const version = uuid.v4();
        const subjectVersions = cache.getSchemaVersionsOfSubject(subject);
        const altVersion = subjectVersions ? subjectVersions.length + 1 : 1;

        storage.createSubject({
            id,
            name: subject,
            schema,
            version,
            altVersion,
            config: registry.getConfig(),
            type: req.schemaType,
            createdAt: Date.now()
        }).then(_ => {
           res.status(200).json({id, version, altVersion});
        }, e => {
            sendError(res, 500, e.message);
        });
    });

    /**
     * list all schema versions registered under a subject
     */
    router.get("/:subject/versions", (req, res) => {

        const versions = cache.getSchemaVersionsOfSubject(req.params.subject);
        if(!versions){
            return res.status(204).json([]);
        }

        res.status(200).json(versions);
    });

    /**
     * fetch latest version of schema registered under a subject
     */
    router.get("/:subject/versions/latest", (req, res) => {
        //TODO returns object with info of subject, version and schema
    });

    /**
     * fetch version of schema registered under a subject
     */
    router.get("/:subject/versions/:version", (req, res) => {
        //TODO returns object with info of subject, version and schema
    });

    return router;
};