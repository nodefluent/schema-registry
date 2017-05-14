"use strict";

const sendError = require("./sendError.js");

const readBodyField = (req, res, fieldName) => {

    if(!req.body){
        sendError(res, 400, "missing body");
        return false;
    }

    const field = req.body[fieldName];
    if(!field){
        sendError(res, 400, `body missing ${fieldName} field`);
        return false;
    }

    return field;
};

module.exports = readBodyField;