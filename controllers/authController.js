const passport = require('passport');
const bcrypt = require('bcrypt');
const { tokenGenerator, OTPGenerator, getCurrentTime, addMinutes, issueJWT, idGenerator } = require('../utils/helpers');
const pool = require('../database/knex');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const error = require('../utils/appError');

const newuser = () => {
	let code = OTPGenerator();
  	let token = tokenGenerator();
  	let created = getCurrentTime();
  	let expired = addMinutes(created, 30);
  	return {code, token, created, expired};
}

const expired = (time) => {
	return addMinutes(time, 30);
}

exports.signup = catchAsync ( async (req, res, next) => {

  	const { name, phone, password, email } = req.body;

  	try {

  		const checkUser = await pool.select('status', 'userId').from('registration').where({email}).limit(1);

  		const { code, created, token } = newuser();

		const passwordHash = await bcrypt.hash(password, 12);

		const userId = idGenerator();

  		if (checkUser.length > 0) {

  			const { status, userId } = checkUser[0];

  			if (status === "0") {

  				const newDoc = await pool('registration').where({userId}).update({name, password:passwordHash, phone, code, token, updated_at:created, created_at:created}).limit(1);

  				const expired = addMinutes(created, 30);

				await new Email(email, name).signupMail(code);

	  			return res.status(200).json({
			        status:"success",
			        message:"Please check your email for your code",
			        data:{
			            exipres:expired,
			            token:token
			        }
			    });

  			}

  			return res.status(401).json({
		        status:"failed",
		        message: `${email} not available`
		    });
  			
  		}

  		const newDoc =  await pool("registration").insert({ userId, email, name, password:passwordHash, phone, code, token, created_at:created});

  		if (newDoc.length > 0) {

  			const expired = addMinutes(created, 30);

			await new Email(email, name).signupMail(code);

  			return res.status(200).json({
		        status:"success",
		        message:"Please check your email for your code",
		        data:{
		            exipres:expired,
		            token:token
		        }
		    });
  		}
  	} catch (err) {

  		console.log(err);

  		return res.status(500).json({
	        status: "failed",
	        message: `Unable to perform request`
	    });
  	}
});

exports.resend = catchAsync ( async (req, res, next) => {

  	const { email } = req.body;

  	try {

  		const checkUser = await pool.select('status', 'name').from('registration').where({email}).limit(1);

  		if (checkUser.length > 0) {

  			const { name, status } = checkUser[0];

  			const { code, token, expired, created } = newuser();

  			if (status === '0') {

  				const newDoc = await pool('registration').where({email}).update({code, token, updated_at:created, created_at:created}).limit(1);

  				const expired = addMinutes(created, 30);

				await new Email(email, name).signupMail(code);

	  			return res.status(200).json({
			        status:"success",
			        message:"Please check your email for your code",
			        data:{
			            exipres:expired,
			            token:token
			        }
			    });
  			}

  			return res.status(400).json({
		        status:"failed",
		        message: `Please proceed to login`
		    });
  		}

  		return res.status(401).json({
	        status:"failed",
	        message: `Record not found`
	    });

  	} catch (err) {

  		return res.status(500).json({
	        status: "failed",
	        message: `Unable to perform request`
	    });
  	}
});

exports.validateOTP = catchAsync ( async (req, res, next) => {

  	const { otp, token } = req.body;

  	const db_tranx = await pool.transaction();

  	try {

  		const checkUser = await pool.select('userId' ,'email' ,'password' ,'created_at').from('registration').where({token,code:otp,status:'0'}).limit(1);
  		
  		if (checkUser.length > 0) {

  			const { userId, email, password, created_at } = checkUser[0];

	  		let now = getCurrentTime();
	  		let date = addMinutes(created_at, 30);

	  		if (date < now) {

	  			return res.status(400).json({
			        status:"failed",
			        message: 'otp has expired'
			    });

			} else {

				const updateUser = await pool('registration').where({email}).update({status:'1',code:'0',updated_at:now}).transacting(db_tranx).limit(1);

				const createUser = await db_tranx.insert({ userId, email, password, created:now}).into("access");

				await db_tranx.commit();

				return res.status(201).json({
			        status:"success",
			        message:'Account created succssfully, please proceed to login'
			    });
			}
  		}

  		return res.status(400).json({
	        status:"failed",
	        message:"Invalid otp"
	    });

  	} catch (err) {

  		await db_tranx.rollback();

  		return res.status(500).json({
	        status: "failed",
	        message: `Unable to perform request`
	    });
  	}
});

exports.login = catchAsync ( async (req, res, next) => {

  	const { email, password } = req.body;
  	
  	try {

  		const checkUser = await pool.select('userId','password' ,'status').from('access').where({email}).limit(1);

  		if (checkUser.length > 0) {

  			const { userId, password: hash, status } = checkUser[0];

  			const checkpass = await bcrypt.compare(password, hash);

  			if (checkpass !== true){
  				return next(new error('Invalid login credentials', 401));
  			}

  			if (status === "0") {
  				return next(new error('Account suspended', 401));
  			}

  			if (checkpass === true && status === "1") {

  				const jwt = issueJWT(userId);

  				const { created } = newuser();

  				await pool('access').where({email}).update({lastin:created}).limit(1);

	  			return res.status(200).json({
			        status:'success',
			        token:jwt
			    });
  			}

  		}

  		return res.status(401).json({
	        status:"failed",
	        message:"Invalid credentials"
	    });

  	} catch (err) {

  		return res.status(500).json({
	        status: "failed",
	        message: `Unable to perform request`
	    });
  	}	
});

exports.checkAuthentication = passport.authenticate('jwt', { session: false });

exports.checkActive = catchAsync (async (req, res, next) => {

	const checkUser =  await pool.select('status').from('registration').where({userId:req.user[0].userId}).limit(1);

	if (checkUser.length > 0) {

		const { status } = checkUser[0];

		if (status === "1") {
			return next();
		}

		return next(new error('Account suspended', 401));
	}

	return next(new error('Unathorized', 401));
});

exports.forgotPassword = catchAsync ( async (req, res, next) => {

	const { email } = req.body;

  	try {

  		const checkUser = await pool("access").join("registration", "access.userId", "=", "registration.userId").select("access.userId", "registration.name").limit(1);

  		if (checkUser.length > 0) {

  			const { userId, name } = checkUser[0];

  			const { code, token, created } = newuser();

  			const newDoc = await pool("reset_password").insert({ userId, email, code, token, created});

  			if (newDoc.length > 0) {

  				const expired = addMinutes(created, 30);

		  		await new Email(email, name.split(' ')[0]).sendPasswordReset(code);

		  		return res.status(201).json({
			        status:"success",
			        message:"Please check your email for reset code",
			        data:{
			            exipres:expired,
			            token:token
			        }
			    });
  			}

  		}

  		return res.status(400).json({
	        status:"failed",
	        message:"Email address not found"
	    });

  	} catch (err) {

  		return res.status(500).json({
	        status: "failed",
	        message: `Unable to perform request`
	    });
  	}
});

exports.resetPassword = catchAsync ( async (req, res, next) => {

	const { password, token, otp } = req.body;

    const db_tranx = await pool.transaction();

  	try {

  		const checkTokenOtp = await pool.select('userId', 'created').from('reset_password').where({token,code:otp,status:'0'}).orderBy('id', 'desc').limit(1);

  		if (checkTokenOtp.length > 0) {

  			const { userId, created } = checkTokenOtp[0];

	  		let now = getCurrentTime();
	  		let date = addMinutes(created, 30);

	  		if (date < now) {

	  			return res.status(400).json({
			        status:"failed",
			        message: 'otp has expired'
			    });

			} else {

				const passwordHash = await bcrypt.hash(password, 12);

				const updateToken = await pool('reset_password').where({token}).update({status:'1',code:'0',created:now}).transacting(db_tranx).limit(1);

				const updatePass = await pool('access').where({userId}).update({password:passwordHash}).transacting(db_tranx).limit(1);

				await db_tranx.commit();

				return res.status(201).json({
			        status:"success",
			        message:'Password reset succssfully, please proceed to login'
			    });
			}
  		}

  		return res.status(400).json({
	        status:"failed",
	        message:"Invalid otp"
	    });

  	} catch (err) {

  		await db_tranx.rollback();

  		return res.status(500).json({
	        status: "failed",
	        message: `Unable to perform request`
	    });
  	}
});

exports.dashboard = catchAsync ( async (req, res, next) => {

	console.log(req);

	return res.status(200).json({
        status:"failed",
        message:"Invalid otp"
    });
});