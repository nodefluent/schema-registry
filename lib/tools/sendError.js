"use strict";

const sendError = (res, statusCode, error) => {
    res.status(statusCode).json({
        error_code: statusCode,
        message: error
    });
};

module.exports = sendError;