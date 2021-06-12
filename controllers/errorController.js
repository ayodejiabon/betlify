const errors = require('../utils/appError');

const handleDuplicaterDB = err => {
	const message = `Duplicate field value, ${err.keyValue.name}, please use another`;
	return new errors(message, 400);
}

const handleCastErrorDB = err => {
	const message = `Invalid ${err.path} for : ${err.value}`;
	return new errors(message, 400);
}

const handleValidationErrorDB = err => {
	const errors =  Object.values(err.errors).map(el => el.message)
	
	const message = `Invalid input data ${errors.join(', ')}`;

	return new errors(message, 400);
}

const handleJWTError = err => new errors("Invalid token please login again", 401);

const handleJWTError1 = err => new errors("You have been logged out, please login again", 401);

const sendErrorDev = (err, req, res) => {
	
	if (req.originalUrl .startsWith('/api')) {
		return res.status(err.statusCode).json({
	        status: err.status,
	        error:err,
	        message: err.message,
	        stack: err.stack
	    })
	}

	return res.status(err.statusCode).json({
		title: 'Something went wrong',
		msg: err.message
	});
}

const sendErrorPro = (err, req, res) => {

	if (req.originalUrl .startsWith('/api')) {

		if (err.isOperational) {
			return res.status(err.statusCode).json({
		        status: err.status,
		        message: err.message
		    })
		}

		return res.status(500).json({
	        status: 'error',
	        message: "Something went very wrong"
	    });

	}

	//for rendered websites view
	return res.status(err.statusCode).json({
		title: 'Something went wrong',
		msg: err.message
	});
	
}

module.exports = (err, req, res, next) => {
	
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error'


	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res);
	}

	if (process.env.NODE_ENV === 'production') {

		let error = {...err};
		error.message = err.message;

		if (err.name === 'CastError') error = handleCastErrorDB(error);

		if (err.code === 11000) error = handleDuplicaterDB(error);

		if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

		if (err.name === 'JsonWebTokenError') error = handleJWTError(error);

		if (err.name === 'TokenExpiredError') error = handleJWTError1(error);

	    sendErrorPro(error, req, res);
	}
}