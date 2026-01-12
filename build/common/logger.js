"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.warning = exports.error = exports.success = void 0;
const chalk_1 = __importDefault(require("chalk"));
async function success(requestName, params) {
    console.log(chalk_1.default.green(requestName, JSON.stringify(params)));
}
exports.success = success;
async function error(requestName, params) {
    console.log(chalk_1.default.red(requestName, JSON.stringify(params)));
}
exports.error = error;
async function warning(requestName, params) {
    console.log(chalk_1.default.magenta(requestName, JSON.stringify(params)));
}
exports.warning = warning;
async function info(requestName, params) {
    console.log(chalk_1.default.yellowBright(requestName, JSON.stringify(params)));
}
exports.info = info;
