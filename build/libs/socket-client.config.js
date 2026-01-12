"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const socketClient = (0, socket_io_client_1.io)("http://192.168.1.46:3006/club-play", { transports: ['websocket'] });
exports.default = socketClient;
