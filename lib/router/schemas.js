"use strict";

const express = require("express");

module.exports = function(){

    const router = express.Router();

    /**
     * fetch a schema by id
     */
    router.get("/ids/:id", (req, res) => {
        //returns schema as object field schema
    });

    return router;
};