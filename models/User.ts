import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize';

class User extends Model {
  json() {
    return {
      uuid: this.get('uuid'),
      email: this.get('email'),
      username: this.get('username'),
      photo: this.get('photo'),
      avatar: this.get('avatar'),
      avatarSource: this.get('avatarSource'),
      avatarX: this.get('avatarX'),
      avatarY: this.get('avatarY'),
      avatarScale: this.get('avatarScale')
    };
  }
}

User.init({

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    unique: true
  },

  email: {
    type: DataTypes.STRING(255),
    validate: { isEmail: true },
  },

  username: {
    type: DataTypes.STRING
  },

  firstName: {
    type: DataTypes.STRING
  },

  lastName: {
    type: DataTypes.STRING
  },

  password: {
    type: DataTypes.STRING
  },

  resetPasswordCode: {
    type: DataTypes.STRING
  },

  emailConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  photo: {
    type: DataTypes.STRING
  },

  logins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  avatar: {
    type: DataTypes.STRING
  },

  avatarSource: {
    type: DataTypes.STRING
  },

  avatarX: {
    type: DataTypes.FLOAT
  },

  avatarY: {
    type: DataTypes.FLOAT
  },

  avatarScale: {
    type: DataTypes.FLOAT
  },

}, {

  sequelize,
  modelName: 'User',
  indexes: [
    { fields: ['email'] },
  ]

});

export default User;
