"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StandardError extends Error {
    constructor(errorCode, message, lastError, context) {
        super(message);
        // So you can do typeof CustomError
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = this.constructor.name;
        this.error_code = errorCode;
        this.lastError = lastError;
        this.context = context;
    }
}
exports.default = StandardError;
