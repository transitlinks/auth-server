import { getLog } from './log';
const log = getLog('passport');

import Local from 'passport-local';
import Facebook from 'passport-facebook';
import Google from 'passport-google-oauth';

import fs from 'fs';
import path from 'path';
import { https } from 'follow-redirects';
import jdenticon from 'jdenticon';
import User from './models/User';
import { login } from './auth';

const {
  AUTH_FB_APPID, AUTH_FB_SECRET, GOOGLE_OAUTH_ID, GOOGLE_OAUTH_SECRET,
  APP_URL, FB_GRAPH_API, MEDIA_PATH, MEDIA_URL
} = process.env;

const downloadPhoto = async (photoUrl, userUuid) => {

  const usersPath = path.join((MEDIA_PATH || path.join(__dirname, 'public')), 'users');
  const userMediaPath = path.join(usersPath, userUuid);
  if (!fs.existsSync(userMediaPath)) {
    fs.mkdirSync(userMediaPath);
  }

  const mediaFilePath = path.join(userMediaPath, 'photo.jpg');

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(mediaFilePath);
    console.log('GET:', photoUrl);
    https.get(photoUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => { // Handle errors
      fs.unlink(mediaFilePath); // Delete the file async. (But we don't check the result)
      reject(err.message);
    });
  });

};

const getAvatarPaths = (user, extension) => {

  const basePath = MEDIA_PATH || path.join(__dirname, 'public');
  const userPath = `/users/${user.uuid}`;
  const avatarSourceFilePath = `${userPath}/avatar-source.${extension}`;
  const avatarFilePath = `${userPath}/avatar.${extension}`;
  if (!fs.existsSync(path.join(basePath, userPath))) {
    fs.mkdirSync(path.join(basePath, userPath));
  }
  return {
    basePath,
    avatarSourceFilePath,
    avatarFilePath
  };

};

export const initStrategies = (passport) => {

  passport.serializeUser((user, done) => {
    log.debug('passport.serializeUser', `user.uuid=${user.uuid}`);
    done(null, user.uuid);
  });

  passport.deserializeUser((uuid, done) => {
    log.debug('deserialize-user', `uuid=${uuid}`);
    User.findOne({ where: { uuid } })
      .then(user => done(null, user.json()));
  });

  passport.use('login-local', new Local.Strategy({
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      log.debug('local-auth', `email=${email} password=${password}`);
      if (email) {
        try {
          const user = await login({ email, password });
          const png = jdenticon.toPng(user.uuid, 74);
          if (!user.avatar) {
            const { basePath, avatarSourceFilePath, avatarFilePath } = getAvatarPaths(user, 'png');
            fs.writeFileSync(path.join(basePath, avatarSourceFilePath), png);
            fs.writeFileSync(path.join(basePath, avatarFilePath), png);
            const username = user.email.substring(0, user.email.indexOf('@'));
            await User.update({
              photo: `${MEDIA_URL}/${user.uuid}.png`,
              avatarSource: avatarSourceFilePath,
              avatar: avatarFilePath,
              username
            }, { where: { uuid: user.uuid } });
          }
          done(null, user);
        } catch (err) {
          done({ message: err.message });
        }
      } else {
        done({ message: 'Invalid login credentials' });
      }

    }
  ));

  passport.use('login-facebook', new Facebook.Strategy({
      clientID: AUTH_FB_APPID,
      clientSecret: AUTH_FB_SECRET,
      callbackURL: `${APP_URL}/auth/facebook/callback`,
      profileFields: [ 'id', 'emails', 'name', 'gender', 'age_range' ],
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      log.debug('fb-auth', `fb-id=${profile.id}`);
      const emails = profile.emails;
      let firstName = null;
      let lastName = null;
      if (profile.name) {
        firstName = profile.name.givenName;
        lastName = profile.name.familyName;
      }
      if (emails && emails.length > 0) {
        const email = emails[0].value;
        const photo = `${FB_GRAPH_API}/${profile.id}/picture?type=large`;
        try {
          log.debug('fb-auth logging in user');
          const user = await login({ email, firstName, lastName, username: `${firstName} ${lastName}`, photo });
          log.debug('fb-auth user logged in', `user=${user}`);
          await downloadPhoto(photo, user.uuid);
          if (!user.avatar) {
            await User.update({ avatar: `/users/${user.uuid}/photo.jpg`, avatarSource: `/users/${user.uuid}/photo.jpg` }, { where: { uuid: user.uuid } });
          }
          done(null, user);
        } catch (err) {
          done({ message: err.message });
        }
      } else {
        done({ message: 'Invalid Facebook profile' });
      }

    }
  ));

  passport.use('login-google', new Google.OAuth2Strategy({
      clientID: GOOGLE_OAUTH_ID,
      clientSecret: GOOGLE_OAUTH_SECRET,
      callbackURL: `${APP_URL}/auth/google/callback`,
      profileFields: [ 'id', 'emails', 'name', 'username', 'gender', 'birthday' ],
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      console.log('got google profile', profile);
      log.debug('google-auth', `google-id=${profile.id}`);
      const emails = profile.emails;
      if (emails && emails.length > 0) {
        const email = emails[0].value;
        let photo = null;
        let firstName = null;
        let lastName = null;
        if (profile.name) {
          firstName = profile.name.givenName;
          lastName = profile.name.familyName;
        }
        if (profile.photos && profile.photos.length > 0) {
          photo = profile.photos[0].value;
          if (photo.indexOf('?sz') != -1) {
            photo = photo.split('?')[0] + '?sz=250';
          }
        }
        try {
          const user = await login({ email, firstName, lastName, username: `${firstName} ${lastName}`, photo });
          await downloadPhoto(photo, user.uuid);
          if (!user.avatar) {
            await User.update({ avatar: `/users/${user.uuid}/photo.jpg`, avatarSource: `/users/${user.uuid}/photo.jpg` }, { where: { uuid: user.uuid } });
          }
          done(null, user);
        } catch (err) {
          done({ message: err.message });
        }
      } else {
        done({ message: 'Invalid Google profile' });
      }

    }
  ));

};
