import * as crypto from 'crypto';
import { ErrorCodes } from 'src/common/error-type';
import { error, info, success } from 'src/common/logger';
import StandardError from 'src/common/standard-error';

const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

async function encryptRestApi(text: string, secretKey: string): Promise<{ public_key: string, content: string }> {
    try {
        info(`******************************************`);
        success(`Response : ${text}`);
        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return {
            public_key: iv.toString('hex'),
            content: encrypted.toString('hex')
        };
    } catch (error) {
        throw new StandardError(
            ErrorCodes.FORM_VALIDATION_ERROR,
            "Don't try to hack. It's impossible."
        );
    }
}

async function decryptRestApi(data: { public_key: string, content: string }, secretKey: string): Promise<string | { public_key: string, content: string }> {
    try {
        const { public_key, content } = data;
        const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(public_key, 'hex'));
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);
        info(`******************************************`);
        error(`Request : ${decrpyted.toString()}`);
        return decrpyted.toString();
    } catch (error) {
        throw new StandardError(
            ErrorCodes.FORM_VALIDATION_ERROR,
            "Don't try to hack. It's impossible."
        );
    }
}

export { encryptRestApi, decryptRestApi };