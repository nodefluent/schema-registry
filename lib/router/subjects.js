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
        res.status(200).json(cache.getSubjectNames());
    });

    /**
     * checks if a schema has been registered under a subject
     */
    router.post("/:subject", (req, res) => {

        const subject = req.params.subject;

        const schema = readBodyField(req, res, "schema");
        if(schema === false){
            return;
        }

        const match = cache.getSchemaVersionByMatch(subject, schema);
        if(!match){
            return sendError(res, 404, "subject or schema does not exist.");
        }

        return res.status(200).json({
            subject,
            id: match.id,
            version: match.version,
            altVersion: match.altVersion,
            type: match.type,
            schema: match.schemaString
        });
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

        const schema = readBodyField(req, res, "schema");
        if(schema === false){
            return;
        }

        let parsedSchema = null;
        try {
            //comes as string
            parsedSchema = JSON.parse(schema);
        } catch(e){
            return res.status(400).json({error: "schema must be a valid json string"});
        }

        if(!getSchema(req).isValidSchema(parsedSchema)){
            return res.status(422).json({error: `invalid ${req.schemaType} schema`});
        }

        //TODO check if compatible with config else return 409

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

        const name = req.params.subject;

        const subject = cache.getLatestSubjectVersion(name);
        if(!subject){
            return sendError(res, 404, "subject does not exist");
        }

        res.status(200).json({
            name,
            version: subject.version,
            type: subject.type, //YOU MUST NOT USE the same subject name for multiple types
            altVersion: subject.altVersion,
            schema: subject.schemaString
        });
    });

    /**
     * fetch version of schema registered under a subject
     */
    router.get("/:subject/versions/:version", (req, res) => {

        const name = req.params.subject;
        const version = req.params.version;

        const subject = cache.getSubject(name);
        if(!subject){
            return sendError(res, 404, "subject does not exist");
        }

        if(!subject[version]){
            return sendError(res, 404, "version of this subject does not exist");
        }

        res.status(200).json({
            name,
            version,
            type: subject[version].type,
            altVersion: subject[version].altVersion,
            schema: subject[version].schemaString
        });
    });

    return router;
};