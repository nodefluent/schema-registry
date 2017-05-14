"use strict";

const express = require("express");

const {sendError} = require("../tools");

module.exports = function(storage, cache, registry){

    const router = express.Router();

    /**
     * fetch a schema by id
     */
    router.get("/ids/:id", (req, res) => {

        const schema = cache.getSchemaById(req.params.id);
        if(!schema){
            return sendError(res, 404, "schema does not exist");
        }

        res.status(200).json(schema.schemaString);
    });

    return router;
};