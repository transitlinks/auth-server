import { Sequelize } from 'sequelize';

const { APP_ENV, DB_URL, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const dbUrl = DB_URL || `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

console.log('DB URL', dbUrl);
const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  native: APP_ENV === 'stage'
});

export default sequelize;
