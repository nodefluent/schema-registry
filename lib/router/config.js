"use strict";

const express = require("express");

module.exports = function(){

    const router = express.Router();

    /**
     * get global config
     */
    router.get("/", (req, res) => {
        //return config object
    });

    /**
     * update config
     */
    router.put("/", (req, res) => {
        //returns config object
    });

    /**
     * set config for subject
     */
    router.put("/:subject", (req, res) => {
        //returns subject config
    });

    return router;
};