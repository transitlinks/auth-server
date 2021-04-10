import { getLog } from './log';
const log = getLog('utils');

import fs, { ReadStream } from 'fs';
import stream from "stream";
import AWS from 'aws-sdk';
import path from "path";
import { FollowResponse, https } from "follow-redirects";
import jdenticon from "jdenticon";
import { IncomingMessage } from "http";

const { MEDIA_PATH } = process.env;

AWS.config = new AWS.Config();
AWS.config.update({
  region: process.env.AWS_S3_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
});

const s3 = new AWS.S3();

const createUploadStream = (readStream: ReadStream | IncomingMessage, key: string): Promise<AWS.S3.ManagedUpload.SendData> => {

  const pass = new stream.PassThrough();
  readStream.pipe(pass);
  return s3
    .upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: pass,
      ACL: 'public-read'
    })
    .promise();

};


export const downloadAndSavePhoto = async (photoUrl: string, userUuid: string): Promise<string> => {

  const usersPath = path.join((MEDIA_PATH || path.join(__dirname, 'public')), 'users');
  const userMediaPath = path.join(usersPath, userUuid);
  if (!fs.existsSync(userMediaPath)) {
    fs.mkdirSync(userMediaPath);
  }

  const mediaFilePath = path.join(userMediaPath, 'photo.jpg');

  return new Promise<string>((resolve, reject) => {
    const file = fs.createWriteStream(mediaFilePath);
    console.log('GET:', photoUrl);
    https.get(photoUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(`/users/${userUuid}/photo.jpg`);
      });
    }).on('error', (err) => { // Handle errors
      fs.unlinkSync(mediaFilePath); // Delete the file async. (But we don't check the result)
      reject(err.message);
    });
  });

};



export const downloadAndUploadPhoto = async (photoUrl: string, userUuid: string): Promise<string> => {

  const mediaFilePath = path.join('users', userUuid, 'photo.jpg');

  return new Promise<string>((resolve, reject) => {
    console.log('GET:', photoUrl);
    https.get(photoUrl, async (response) => {
      const result = await createUploadStream(response, mediaFilePath);
      resolve(result.Location);
    }).on('error', (err) => { // Handle errors
      reject(err.message);
    });
  });

};


export const downloadPhoto = async (photoUrl: string, userUuid: string): Promise<string> => {
  if (process.env.APP_ENV === 'stage') {
    return downloadAndUploadPhoto(photoUrl, userUuid);
  } else {
    return downloadAndSavePhoto(photoUrl, userUuid);
  }
};


export const createAvatar = (user, extension) => {

  const basePath = MEDIA_PATH || path.join(__dirname, 'public');
  const userPath = `/users/${user.uuid}`;
  const avatarSourceFilePath = `${userPath}/avatar-source.${extension}`;
  const avatarFilePath = `${userPath}/avatar.${extension}`;
  if (!fs.existsSync(path.join(basePath, userPath))) {
    fs.mkdirSync(path.join(basePath, userPath));
  }

  const png = jdenticon.toPng(user.uuid, 74);
  fs.writeFileSync(path.join(basePath, avatarSourceFilePath), png);
  fs.writeFileSync(path.join(basePath, avatarFilePath), png);

  return {
    basePath,
    avatarSourceFilePath,
    avatarFilePath
  };

};
