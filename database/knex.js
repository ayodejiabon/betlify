const dotenv = require('dotenv');
dotenv.config({path: '../config.env'});
const environment = process.env.NODE_ENV || 'development'
const config = require('./knexfile.js')[environment];
const pool = require('knex')(config);
module.exports = pool;