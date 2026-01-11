"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.deleteFile = deleteFile;
exports.uploadMultipleFile = uploadMultipleFile;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const multer_1 = __importDefault(require("multer"));
const util_1 = __importDefault(require("util"));
const moment_1 = __importDefault(require("moment"));
const storage = multer_1.default.memoryStorage();
var multerFile = (0, multer_1.default)({ storage: storage });
// Set up AWS S3
const s3Client = new client_s3_1.S3Client({
    region: process?.env?.REGION ?? "ap-south-1",
    credentials: {
        accessKeyId: "AKIAUBKFCJYP2UJDMJYK",
        secretAccessKey: "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",
    },
});
// const s3Client = new S3Client({
//     region: process?.env?.REGION ?? "ap-south-1",
//     credentials: {
//         accessKeyId: process?.env?.ACCESS_KEY_ID ?? "AKIAYMI5KXNR7R4J77IE",
//         secretAccessKey: process?.env?.SECRET_ACCESS_KEY ?? "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"
//     },
// });
// Permanent Presigned URL
async function generatePermanentPresignedUrl(bucketName, key) {
    const expiresIn = 600000;
    const command = new client_s3_1.GetObjectCommand({ Bucket: bucketName, Key: key });
    const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn }); // 1 year in seconds
    return signedUrl;
}
// Upload User File
async function uploadFile(req, res, next) {
    try {
        const upload = util_1.default.promisify(multerFile.single("FILE"));
        await upload(req, res);
        const file = req?.file;
        if (!file) {
            return {
                status: false,
            };
        }
        else {
            const fileKey = `${(0, moment_1.default)().unix()}-${file.originalname}`;
            const bucketName = process?.env?.BUCKET_NAME ?? "cobra-bucket";
            const uploadParams = {
                Bucket: `${bucketName}`,
                Key: `${fileKey}`,
                Body: file.buffer,
                ContentType: file.mimetype,
            };
            const command = new client_s3_1.PutObjectCommand(uploadParams);
            await s3Client.send(command);
            const presignedUrl = await generatePermanentPresignedUrl(bucketName, `${fileKey}`);
            if (!presignedUrl) {
                return res
                    .status(400)
                    .json({ status: false, message: "AWS upload error." });
            }
            return {
                status: true,
                FILE: presignedUrl,
                BUCKET_NAME: bucketName,
                KEY: `${fileKey}`,
            };
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}
async function uploadMultipleFile(req, res, next) {
    try {
        const upload = util_1.default.promisify(multerFile.fields([{ name: "FILES" }, { name: "FILE", maxCount: 1 }]));
        await upload(req, res);
        const file = req?.files;
        console.log(file.FILE);
        console.log(file.FILES);
        if (file?.FILE?.length <= 0 || file?.FILES?.length <= 0) {
            // return res.status(400).json({ status: false, msg: 'Please Upload User Avatar' });
            return {
                status: false,
            };
        }
        else {
            const fileKey = `${(0, moment_1.default)().unix()}-${file?.FILE?.[0].originalname}`;
            const bucketName = process?.env?.BUCKET_NAME ?? "cobra-bucket";
            const uploadParams = {
                Bucket: `${bucketName}`,
                Key: `${fileKey}`,
                Body: file?.FILE?.[0]?.buffer,
                ContentType: file?.FILE?.[0]?.mimetype,
            };
            const command = new client_s3_1.PutObjectCommand(uploadParams);
            await s3Client.send(command);
            const presignedUrl = await generatePermanentPresignedUrl(bucketName, `${fileKey}`);
            if (!presignedUrl) {
                return res
                    .status(400)
                    .json({ status: false, message: "AWS upload error." });
            }
            const ITEM_NAME = [];
            for (let index = 0; index < file?.FILES?.length; index++) {
                const fileKey = `${(0, moment_1.default)().unix()}-${file?.FILES?.[index]?.originalname}`;
                const bucketName = process?.env?.BUCKET_NAME ?? "cobra-bucket";
                const uploadParams = {
                    Bucket: `${bucketName}`,
                    Key: `${fileKey}`,
                    Body: file?.FILES?.[index]?.buffer,
                    ContentType: file?.FILES?.[index]?.mimetype,
                };
                const command = new client_s3_1.PutObjectCommand(uploadParams);
                await s3Client.send(command);
                const presignedUrl = await generatePermanentPresignedUrl(bucketName, `${fileKey}`);
                ITEM_NAME.push({
                    FILE: presignedUrl,
                    BUCKET_NAME: bucketName,
                    KEY: `${fileKey}`,
                    INDEX: index + 1,
                });
            }
            return {
                status: true,
                FILE: presignedUrl,
                BUCKET_NAME: bucketName,
                KEY: `${fileKey}`,
                ITEM_NAME,
            };
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}
// delete File
async function deleteFile(bucketName, key) {
    try {
        const data = await s3Client.send(new client_s3_1.DeleteObjectCommand({ Bucket: bucketName, Key: key }));
        return !!data;
    }
    catch (error) {
        return false;
    }
}
