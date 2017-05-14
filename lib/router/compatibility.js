"use strict";

const express = require("express");

module.exports = function(){

    const router = express.Router();

    /**
     * test compatibility of a schema with the latest schema under a subject
     */
    router.post("/subjects/:subject/versions/latest", (req, res) => {
        //TODO returns is_compatible as boolean
    });

    /**
     * test compatibility of a schema with a version of schema under a subject
     */
    router.post("/subjects/:subject/versions/:version", (req, res) => {
        //TODO returns is_compatible as boolean
    });

    return router;
};