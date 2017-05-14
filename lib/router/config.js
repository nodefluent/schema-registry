"use strict";

const express = require("express");

const {readBodyField, sendError} = require("../tools");

module.exports = function(storage, cache, registry){

    const router = express.Router();

    /**
     * get global config
     */
    router.get("/", (req, res) => {
        res.status(200).json(registry.getConfig());
    });

    /**
     * update config
     */
    router.put("/", (req, res) => {

        const config = readBodyField(req, res, "config");
        if(config === false){
            return;
        }

        registry.updateConfig(config);
        res.status(200).json(registry.getConfig());
    });

    /**
     * set config for subject
     */
    router.put("/:subject", (req, res) => {

        const config = readBodyField(req, res, "config");
        if(config === false){
            return;
        }

        const subject = req.params.subject;
        if(!cache.getSubject(subject)){
            return sendError(res, 404, "subject does not exist");
        }

        storage.storeConfig({
            subject,
            config
        }).then(_ => {
            res.status(200).json(config);
        }, e => {
            sendError(res, 500, e.message);
        });
    });

    return router;
};