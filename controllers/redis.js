const redis = require('redis');
const dotenv = require('dotenv');
dotenv.config({path: '../config.env'});

let client;

if (process.env.NODE_ENV === "development") {

	client = redis.createClient({
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT
	});
}

if (process.env.NODE_ENV === "staging" || process.env.NODE_ENV === "production") {

	client = redis.createClient({
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
		user: process.env.REDIS_USERNAME,
		auth_pass: process.env.REDIS_PASSWORD,
		tls: {},
		retry_strategy: function (options) {
	        if (options.error && options.error.code === 'ECONNREFUSED') {
	            return new Error('The server refused the connection');
	        }
	        if (options.total_retry_time > 1000 * 60 * 60) {
	            return new Error('Retry time exhausted');
	        }
	        if (options.attempt > 10) {
	            return undefined;
	        }
	        return Math.min(options.attempt * 100, 3000);
	    }
	});
}

client.on("connect", function() {
  console.error("redis connected successfully");
});

client.on("error", function(error) {
  console.log("redis error: ", error);
});

module.exports = client;