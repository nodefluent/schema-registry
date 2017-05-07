"use strict";

const express = require("express");

module.exports = function(storage, cache, config){

    const router = express.Router();

    /**
     * list all subjects
     */
    router.get("/", (req, res) => {
        //returns array
    });

    /**
     * checks if a schema has been registered under a subject
     */
    router.post("/:subject", (req, res) => {
        //returns full schema + subject
    });

    /**
     * register a new version under a subject
     */
    router.post("/:subject/versions", (req, res) => {

        const schema = req.body.schema;
        if(!schema){
            return res.status(400).end();
        }

        //TODO sync versioning & ids across cluster
        const id = 1;
        const version = 1;

        storage.create({
            id,
            name: req.params.subject,
            schema,
            version,
            config
        }).then(_ => {
           res.status(200).json({id});
        }, e => {
            console.log(e); //TODO remove
            res.status(500).end();
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
        //returns object with info of subject, version and schema
    });

    /**
     * fetch version of schema registered under a subject
     */
    router.get("/:subject/versions/:version", (req, res) => {
        //returns object with info of subject, version and schema
    });

    return router;
};