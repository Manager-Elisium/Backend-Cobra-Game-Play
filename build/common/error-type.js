"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodeMap = exports.ErrorCodes = void 0;
// Please DON'T change this file directly!!!
exports.ErrorCodes = {
    API_VALIDATION_ERROR: "API_VALIDATION_ERROR",
    REQUEST_FORBIDDEN_ERROR: "REQUEST_FORBIDDEN_ERROR",
    NOT_FOUND: "NOT_FOUND",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    FORM_VALIDATION_ERROR: "FORM_VALIDATION_ERROR",
    INVALID_AUTH: "INVALID_AUTH",
};
exports.ErrorCodeMap = {
    API_VALIDATION_ERROR: 400,
    REQUEST_FORBIDDEN_ERROR: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    FORM_VALIDATION_ERROR: 400,
    INVALID_AUTH: 401
};
