"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const moment_1 = __importDefault(require("moment"));
const crypto_1 = __importDefault(require("crypto"));
const enkey = 'DAED19E749D0C068';
class SocketService {
    static encrypt(toCrypt) {
        const keyBuf = Buffer.from(SocketService.enkey);
        const cipher = crypto_1.default.createCipheriv('aes128', keyBuf, keyBuf);
        try {
            let output = cipher.update(JSON.stringify(toCrypt), 'utf-8', 'base64') + cipher.final('base64');
            return output;
        }
        catch (e) {
            return null;
        }
    }
    static decrypt(data) {
        const keyBuf = Buffer.from(SocketService.enkey);
        const deCipher = crypto_1.default.createDecipheriv('aes128', keyBuf, keyBuf);
        try {
            let decrypted = deCipher.update(data, 'base64', 'utf8') + deCipher.final('utf8');
            return JSON.parse(decrypted);
        }
        catch (e) {
            return null;
        }
    }
    static sendMsgToUser(socket, en, msg) {
        const xx = SocketService.encrypt(msg);
        const send = {
            final: xx
        };
        console.log((0, moment_1.default)(new Date()), "------", en, "------", msg);
        socket.emit(en, send);
    }
    static receiveMsgFromUser(data) {
        const reqData = data.final;
        let final = "";
        if (reqData) {
            final = SocketService.decrypt(reqData);
        }
        console.log((0, moment_1.default)(new Date()), "------", final);
        return final;
    }
    static sendMsgToSingleUser(IO, socket, en, msg) {
        if (process.env.isEncrypt) {
            console.log((0, moment_1.default)(new Date()), "------", en, "------", msg);
            const xx = SocketService.encrypt(msg);
            const send = {
                final: xx
            };
            IO.to(socket).emit(en, send);
        }
        else {
            IO.to(socket).emit(en, msg);
        }
    }
    static sendMsgToAllUser(IO, roomname, en, msg) {
        if (process.env.isEncrypt) {
            const xx = SocketService.encrypt(msg);
            const send = {
                final: xx
            };
            IO.in(roomname).emit(en, send);
        }
        else {
            IO.in(roomname).emit(en, msg);
        }
    }
    static sendMsgToExceptUser(socket, roomname, en, msg) {
        if (process.env.isEncrypt) {
            const xx = SocketService.encrypt(msg);
            const send = {
                final: xx
            };
            socket.to(roomname).emit(en, send);
        }
        else {
            socket.to(roomname).emit(en, msg);
        }
    }
}
exports.SocketService = SocketService;
SocketService.enkey = enkey;
