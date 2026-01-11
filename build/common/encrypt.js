"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto = __importStar(require("crypto"));
const standard_error_1 = __importDefault(require("./standard-error"));
const error_type_1 = require("./error-type");
const logger_1 = require("./logger");
const algorithm = 'aes-256-cbc';
const secretKey = process?.env?.SECRET_KEY ?? 'SM20zD0thg8T5Gz3scOSQ2W4r6r7GJqR';
const iv = crypto.randomBytes(16);
async function encrypt(text) {
    try {
        (0, logger_1.info)(`******************************************`);
        (0, logger_1.success)(`Response : ${text}`);
        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return {
            public_key: iv.toString('hex'),
            content: encrypted.toString('hex')
        };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.FORM_VALIDATION_ERROR, "Don't try to hack. It's impossible.");
    }
}
async function decrypt(data) {
    try {
        const { public_key, content } = data;
        const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(public_key, 'hex'));
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);
        (0, logger_1.info)(`******************************************`);
        (0, logger_1.error)(`Request : ${decrpyted.toString()}`);
        return decrpyted.toString();
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.FORM_VALIDATION_ERROR, "Don't try to hack. It's impossible.");
    }
}
// console.log(encrypt(JSON.stringify({"seasonCollected":[{"ID":"ac4b671d-4c0e-4316-b1e6-845744046916","LEVEL":"Level 1","TYPE":"Coin","ITEM_NAME":"","VALUE":"100","EMOJI_IMAGES":[]}]})))
// console.log(encrypt(JSON.stringify({SHOP_ID: "dbdde90a-a5a1-4789-a908-e005ab8bc9a1"})))
// console.log(encrypt(JSON.stringify({USER_NAME: "manthanP", PASSWORD: "12345678"})))
// console.log(encrypt(JSON.stringify({USER_NAME: "pctest", PASSWORD: "12345678"})))
