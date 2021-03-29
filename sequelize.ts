import { Sequelize } from 'sequelize';

const { APP_ENV, DB_URL, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const dbUrl = DB_URL || `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

console.log('DB URL', dbUrl);
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  dialect: 'postgres',
  port: Number(DB_PORT),
  host: DB_HOST,
  pool: {
    max: 10,
    idle: 30000
  },
});

export default sequelize;
