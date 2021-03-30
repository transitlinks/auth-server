import { getLog } from './log';
const log = getLog('core/auth');

import bcrypt from 'bcrypt-nodejs';
import User from './models/User';

export const login = async (userData) => {

  const { email, firstName, lastName, username, password, photo } = userData;

  log.debug('login', `email=${email}`);
  let user = await User.findOne({ where: { email } });
  log.debug('found user', `user=${user}`);

  if (!user) {
    log.debug('login', 'create-user', `email=${email}`, `photo=${photo}`, `password=${password}`);
    const pwdHash = !(password && password.length > 0) ? null :
      bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
    console.log("NEW USER");
    user = await User.create({
      email,
      photo,
      firstName,
      lastName,
      username,
      password: pwdHash
    });
  }

  if (user) {

    log.debug('getUser', 'user-found', `user.uuid=${user.get('uuid')}`);

    if (password) {
      if (!bcrypt.compareSync(password, user.get('password'))) {
        throw new Error('Invalid username or password');
      }
    }

    const logins = (user.logins || 0) + 1;
    const values = { logins };
    if (photo) values.photo = photo;

    log.debug('update user', `values=${values}`);
    await User.update(values, { where: { id: user.id } });

    return user.json();

  }

};
