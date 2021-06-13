const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({path: '../config.env'});

module.exports = {
  development: {
    client: process.env.DB_DIALECT,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './migrations',
      tableName: 'migrations',
    },
    seeds:{
      directory: './seeds'
    }
  },
  staging: {
    client: process.env.DB_DIALECT,
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    ssl: { ca:fs.readFileSync(`${__dirname}/../config/mysql.crt`)},
    pool: {
      min: 2,
      max: 10,
    },
    seeds: {directory: './seeds'},
    migrations: {
      directory: './migrations',
      tableName: 'migrations',
    }
  },

  production: {
    client: process.env.DB_DIALECT,
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    pool: {
      min: 2,
      max: 10,
    },
    ssl: { ca:fs.readFileSync(`${__dirname}/../config/mysql.crt`)},
    pool: {min: 2, max: 10},
    seeds: {directory: './seeds'},
    migrations: {
      directory: './migrations',
      tableName: 'migrations',
    }
  }
};
