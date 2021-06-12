const fs = require('fs');
const path = require('path');
const pool = require('../database/knex');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const catchAsync = require('../utils/catchAsync');

const pathToKey = path.join(__dirname, '../config', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const options = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey:PUB_KEY,
	algorithms: [process.env.JWT_ALOGRITHM]
};

const strategy = new JwtStrategy(options, (payload, done) => {

	pool.select('userId').from('access').where({userId:payload.sub}).limit(1)
	.then((user) => {
			if (user) {
				return done(null, user);
			}else{
				return done(null, false, {message:"Invalid credentials"});
			}
		})
		.catch(err => done(err, null, {message:"Invalid login credentials"}))
});

module.exports = (passport) => {
	passport.use(strategy);
}