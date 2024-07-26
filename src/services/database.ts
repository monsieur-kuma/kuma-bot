import { Sequelize } from 'sequelize';
import SQLite from 'sqlite3';

export default () => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: process.env.NODE_ENV === 'development',
    dialectOptions: {
      // eslint-disable-next-line no-bitwise
      mode: SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE | SQLite.OPEN_FULLMUTEX,
    },
    define: {
      freezeTableName: true,
    },
  });

  return sequelize;
};
