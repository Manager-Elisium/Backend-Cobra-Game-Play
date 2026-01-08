import {
  GetObjectCommand,
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import util from "util";
import { NextFunction, Request, Response } from "express";
import moment from "moment";

const storage = multer.memoryStorage();
var multerFile = multer({ storage: storage });

// Set up AWS S3
const s3Client = new S3Client({
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
async function generatePermanentPresignedUrl(
  bucketName: string,
  key: string
): Promise<string> {
  const expiresIn = 600000;
  const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn }); // 1 year in seconds
  return signedUrl;
}

// Upload User File
async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    const upload = util.promisify(multerFile.single("FILE"));
    await upload(req, res);

    const file = req?.file;
    if (!file) {
      return {
        status: false,
      };
    } else {
      const fileKey = `${moment().unix()}-${file.originalname}`;
      const bucketName = process?.env?.BUCKET_NAME ?? "cobra-bucket";

      const uploadParams = {
        Bucket: `${bucketName}`,
        Key: `${fileKey}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      const presignedUrl = await generatePermanentPresignedUrl(
        bucketName,
        `${fileKey}`
      );

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
  } catch (error: any) {
    console.log(error);
    next(error);
  }
}

async function uploadMultipleFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const upload = util.promisify(
      multerFile.fields([{ name: "FILES" }, { name: "FILE", maxCount: 1 }])
    );
    await upload(req, res);

    const file = req?.files as any;
    console.log(file.FILE);
    console.log(file.FILES);
    if (file?.FILE?.length <= 0 || file?.FILES?.length <= 0) {
      // return res.status(400).json({ status: false, msg: 'Please Upload User Avatar' });
      return {
        status: false,
      };
    } else {
      const fileKey = `${moment().unix()}-${file?.FILE?.[0].originalname}`;
      const bucketName = process?.env?.BUCKET_NAME ?? "cobra-bucket";

      const uploadParams = {
        Bucket: `${bucketName}`,
        Key: `${fileKey}`,
        Body: file?.FILE?.[0]?.buffer,
        ContentType: file?.FILE?.[0]?.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      const presignedUrl = await generatePermanentPresignedUrl(
        bucketName,
        `${fileKey}`
      );

      if (!presignedUrl) {
        return res
          .status(400)
          .json({ status: false, message: "AWS upload error." });
      }

      const ITEM_NAME = [];

      for (let index = 0; index < file?.FILES?.length; index++) {
        const fileKey = `${moment().unix()}-${
          file?.FILES?.[index]?.originalname
        }`;
        const bucketName = process?.env?.BUCKET_NAME ?? "cobra-bucket";

        const uploadParams = {
          Bucket: `${bucketName}`,
          Key: `${fileKey}`,
          Body: file?.FILES?.[index]?.buffer,
          ContentType: file?.FILES?.[index]?.mimetype,
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        const presignedUrl = await generatePermanentPresignedUrl(
          bucketName,
          `${fileKey}`
        );
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
  } catch (error: any) {
    console.log(error);
    next(error);
  }
}

// delete File
async function deleteFile(bucketName: string, key: string): Promise<boolean> {
  try {
    const data = await s3Client.send(
      new DeleteObjectCommand({ Bucket: bucketName, Key: key })
    );
    return !!data;
  } catch (error) {
    return false;
  }
}

export { uploadFile, deleteFile, uploadMultipleFile };
