const mysql = require('mysql');

const db_config = {
	connectionLimit : 5,
  	host: process.env.DB_HOST,
  	user: process.env.DB_USERNAME,
  	password: process.env.DB_PASSWORD,
  	database: process.env.DB_NAME,
   	connectTimeout: 10000,
   	waitForConnections: true
};

const pool  = mysql.createPool(db_config);

pool.getConnection(function(err, connection) {
  if (err) console.log("Database connection error: "+err);
	console.log("Database connected");
});

pool.on('error', function(err) {
  console.log("Database connection errors: "+err.code);
});


module.exports = pool;