import { Sequelize } from 'sequelize';

const { APP_ENV, DB_URL, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const dbUrl = DB_URL || `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: APP_ENV === 'stage'
  },
  logging: false,
  define: {
    freezeTableName: true,
  }
});

export default sequelize;
