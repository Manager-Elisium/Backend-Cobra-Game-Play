"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const module_alias_1 = __importDefault(require("module-alias"));
module_alias_1.default.addAlias('src', (0, path_1.resolve)(__dirname, './'));
