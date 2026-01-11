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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = verifyAccessToken;
exports.verifyAccessTokenRestApi = verifyAccessTokenRestApi;
exports.signAccessToken = signAccessToken;
exports.signAccessTokenForDummyUser = signAccessTokenForDummyUser;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const error_type_1 = require("src/common/error-type");
async function verifyAccessToken(token) {
    if (token) {
        try {
            const decoded = await (0, jsonwebtoken_1.verify)(token, process.env.AUTH_KEY ?? "");
            // console.log(decoded);
            return decoded;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    else {
        return false;
    }
}
async function verifyAccessTokenRestApi(request, response, next) {
    if (!request?.headers["authorization"]) {
        return response
            .status(error_type_1.ErrorCodeMap.INVALID_AUTH)
            .json({ message: "Invalid Authorization." });
    }
    const authHeader = request?.headers["authorization"]?.split(" ");
    if (!authHeader[1]) {
        return response
            .status(error_type_1.ErrorCodeMap.INVALID_AUTH)
            .json({ message: "Invalid Authorization." });
    }
    return new Promise((resolve, reject) => {
        (0, jsonwebtoken_1.verify)(authHeader[1], process.env.AUTH_KEY ?? "", (error, decoded) => {
            if (error) {
                return response
                    .status(error_type_1.ErrorCodeMap.INVALID_AUTH)
                    .json({ message: error });
            }
            else {
                request.body.token = JSON.parse(JSON.stringify(decoded));
                next();
            }
        });
    });
}
async function signAccessToken(data) {
    const payload = {
        ...data
    };
    const secret = process.env.AUTH_KEY ?? "";
    const options = {
        expiresIn: "1d",
        issuer: "cobra.user.com",
        audience: JSON.stringify(payload)
    };
    let getToken = await jsonwebtoken_1.default.sign(payload, secret, options);
    return getToken;
}
async function signAccessTokenForDummyUser(data) {
    const payload = {
        ...data
    };
    const secret = process.env.AUTH_KEY ?? "";
    const options = {
        expiresIn: "1d",
        issuer: "cobra.user.com",
        audience: JSON.stringify(payload)
    };
    let getToken = await jsonwebtoken_1.default.sign(payload, secret, options);
    return getToken;
}
