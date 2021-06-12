const path = require('path');
const fs = require('fs');
const moment = require('moment');
const crypto = require('crypto');
const uniqid = require('uniqid');
const moment2 = require('moment-timezone');
const jsonwebtoken = require('jsonwebtoken');
const randomCode = require('random-code-generate');
const catchAsync = require('../utils/catchAsync');

exports.OTPGenerator = () => {
	return randomCode.generateOtp();
}

exports.tokenGenerator = () => {

	const token = crypto.randomBytes(32).toString('hex');

	const finalToken = crypto.createHash('sha256').update(token).digest('hex');

	return finalToken;
};

exports.idGenerator = () => {
  var ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) => s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))
  return ObjectId();
}

exports.getCurrentTime = () => {
	const time = moment().format();
	return time;
}

exports.addMinutes = (time, minutes) => {
	return moment(time).add(minutes, 'm').format();
}

exports.generateReference = () => {
	return uniqid();
}

exports.getTimeZoneTime = (time, hour) => {
	return moment(time).add(hour, 'hours').format();
}
exports.getTimeZoneTime = (time, hour) => {
	return moment(time).add(hour, 'hours').format();
}

exports.issueJWT = (_id) => {

  	const expiresIn = process.env.JWT_EXPIRES;

  	const pathToKey = path.join(__dirname, '../config', 'id_rsa_priv.pem');
	const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

  	const payload = {
	    sub: _id,
	    iat: Date.now()
  	};

  	const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: process.env.JWT_EXPIRES, algorithm: process.env.JWT_ALOGRITHM });

 	return signedToken;
}