"use strict";

const express = require("express");
const router = express.Router();

/**
 * test compatibility of a schema with the latest schema under a subject
 */
router.post("/subjects/:subject/versions/latest", (req, res) => {
    //returns is_compatible as boolean
});

/**
 * test compatibility of a schema with a version of schema under a subject
 */
router.post("/subjects/:subject/versions/:version", (req, res) => {
    //returns is_compatible as boolean
});

module.exports = router;