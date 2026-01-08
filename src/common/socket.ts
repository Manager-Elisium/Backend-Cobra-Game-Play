import moment from 'moment';
import crypto from 'crypto';

const enkey = 'DAED19E749D0C068';

export class SocketService {
  private static enkey: string = enkey;

  private static encrypt(toCrypt: any): string | null {
    const keyBuf = Buffer.from(SocketService.enkey);
    const cipher = crypto.createCipheriv('aes128', keyBuf, keyBuf);
    try {
      let output = cipher.update(JSON.stringify(toCrypt), 'utf-8', 'base64') + cipher.final('base64');
      return output;
    } catch (e) {
      return null;
    }
  }

  private static decrypt(data: string): any {
    const keyBuf = Buffer.from(SocketService.enkey);
    const deCipher = crypto.createDecipheriv('aes128', keyBuf, keyBuf);
    try {
      let decrypted = deCipher.update(data, 'base64', 'utf8') + deCipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (e) {
      return null;
    }
  }

  public static sendMsgToUser(socket: any, en: string, msg: any) {
    const xx = SocketService.encrypt(msg);
    const send = {
      final: xx
    };
    console.log(moment(new Date()), "------", en, "------", msg);
    socket.emit(en, send);
  }

  public static receiveMsgFromUser(data: any) {
    const reqData = data.final;
    let final = "";
    if (reqData) {
      final = SocketService.decrypt(reqData);
    }
    console.log(moment(new Date()), "------", final);
    return final;
  }

  public static sendMsgToSingleUser(IO: any, socket: any, en: string, msg: any) {
    if (process.env.isEncrypt) {
      console.log(moment(new Date()), "------", en, "------", msg);
      const xx = SocketService.encrypt(msg);
      const send = {
        final: xx
      };
      IO.to(socket).emit(en, send);
    } else {
      IO.to(socket).emit(en, msg);
    }
  }

  public static sendMsgToAllUser(IO: any, roomname: string, en: string, msg: any) {
    if (process.env.isEncrypt) {
      const xx = SocketService.encrypt(msg);
      const send = {
        final: xx
      };
      IO.in(roomname).emit(en, send);
    } else {
      IO.in(roomname).emit(en, msg);
    }
  }

  public static sendMsgToExceptUser(socket: any, roomname: string, en: string, msg: any) {
    if (process.env.isEncrypt) {
      const xx = SocketService.encrypt(msg);
      const send = {
        final: xx
      };
      socket.to(roomname).emit(en, send);
    } else {
      socket.to(roomname).emit(en, msg);
    }
  }
}
