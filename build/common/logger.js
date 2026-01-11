"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.error = error;
exports.warning = warning;
exports.info = info;
const chalk_1 = __importDefault(require("chalk"));
async function success(requestName, params) {
    console.log(chalk_1.default.green(requestName, JSON.stringify(params)));
}
async function error(requestName, params) {
    console.log(chalk_1.default.red(requestName, JSON.stringify(params)));
}
async function warning(requestName, params) {
    console.log(chalk_1.default.magenta(requestName, JSON.stringify(params)));
}
async function info(requestName, params) {
    console.log(chalk_1.default.yellowBright(requestName, JSON.stringify(params)));
}
