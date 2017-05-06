"use strict";

const express = require("express");
const router = express.Router();

/**
 * list all subjects
 */
router.get("/", (req, res) => {
     //returns array
});

/**
 * creates/checks if a schema has been registered under a subject
 */
router.post("/:subject", (req, res) => {
    //returns full schema + subject
});

/**
 * register a new version under a subject
 */
router.post("/:subject/versions", (req, res) => {
    //returns version id
});

/**
 * list all schema versions registered under a subject
 */
router.post("/:subject/versions", (req, res) => {
    //returns array of numbers
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

module.exports = router;