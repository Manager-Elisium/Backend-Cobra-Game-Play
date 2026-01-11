"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
exports.createRabbitmqConnection = createRabbitmqConnection;
const amqplib_1 = __importDefault(require("amqplib"));
exports.connection = null;
async function createRabbitmqConnection() {
    if (!exports.connection) {
        const amqpServer = process.env.RABBITMQ_CLIENT;
        exports.connection = await amqplib_1.default.connect(amqpServer);
    }
    return exports.connection;
}
