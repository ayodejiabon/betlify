const path = require('path');
const multer = require('multer');
const redis = require('redis');
const { promisify } = require('util');
const multerGoogleStorage = require('multer-cloud-storage');
const pool = require('../database/knex');
const catchAsync = require('../utils/catchAsync');
const { resolveAccountNumber, listBanks } = require('../controllers/paystackController');
const { tokenGenerator, getCurrentTime } = require('../utils/helpers');
const { findAddress, decodeAddress, storage } = require('../controllers/googleController');
const error = require('../utils/appError');

const client = redis.createClient({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT
});

const set_async = promisify(client.set).bind(client);
const get_async = promisify(client.get).bind(client);

exports.listBanks = catchAsync ( async (req, res, next) => {

  	try {

  		const banksList = await get_async('banksList');

  		if (banksList) {

  			return res.status(200).json({
		        status:"success",
		        data:JSON.parse(banksList)
		    });
  		}

  		const { body: { status, message, data } }  = await listBanks('NGN');

  		const saveBanks = await set_async('banksList', JSON.stringify(data), 'EX', 60);

  		if (status === true) {

  			return res.status(200).json({
		        status:"success",
		        message:message,
		        data
		    });
  		}

  		return next();

  	} catch (err) {

  		return res.status(500).json({
	        status: "failed",
	        message: err.message
	    });
  	}
});

exports.resolvebank = catchAsync ( async (req, res, next) => {

	const { account_no, bank_code } = req.body;

  	try {

  		const { body: { status, message, data } } = await resolveAccountNumber(account_no, bank_code);

  		const check = await pool.select('name').from('registration').where('userId', '=', req.user[0].userId).limit(1);

  		let name = check[0].name.toLowerCase();

  		let namesplit = name.split(' ');

  		let matches = false;

  		if (data.account_name.toLowerCase().includes(namesplit[0]) && data.account_name.toLowerCase().includes(namesplit[1])){
  			matches = true;
  		}

  		if (status === true){

  			return res.status(200).json({
		        status:"success",
		        message:message,
		        data: {'name':data.account_name,matches}
		    });
  		}

  		return next();

  	} catch (err) {

  		return res.status(err.statusCode).json({
	        status: "failed",
	        message: err.body.message
	    });
  	}
});

exports.searchAddress = catchAsync ( async (req, res, next) => {

	const { address } = req.body;

	if (!address) {
		return next(new error('address is required', 422))
	}

	try {

		const {data: { status, predictions }} = await findAddress(address);

		if (status === "OK"){

			const address_data = predictions.map(el => ({ place_id: el.place_id, name: el.description }));

			return res.status(200).json({
		        status:"success",
		        data:address_data
		    });
		}

		return next();

	} catch (err) {
		return res.status(err.status).json({
	        status: "failed",
	        message: err.statusText
	    });
	}
});

exports.decodeAddress = catchAsync ( async (req, res, next) => {

	const { place_id } = req.body;

	if (!place_id) {
		return next(new error('place_id is required', 422))
	}

	try {

		const { data: { status, result } } = await decodeAddress(place_id);

		let city;
		const address = result.name;
		let country;
		let country_short_code;

		result.address_components.forEach((el) => {
			if (el.types[0] === "locality") {city = el.long_name}
			if (el.types[0] === "administrative_area_level_1") {state = el.long_name}
			if (el.types[0] === "country") {country = el.long_name; country_short_code = el.short_name}
		});

		if (country === "Nigeria" && country_short_code === "NG") {

			return res.status(200).json({
		        status:"success",
		        data:{address,city,state,country}
		    });

		}else{

			return res.status(400).json({
		        status:"failed",
		        message:'We are currently operating in Nigeria only'
		    });
		}

		return next();

	} catch (err) {

		return res.status(err.status).json({
	        status: "failed",
	        message: err.statusText
	    });
	}
});

exports.checkKyc = catchAsync ( async (req, res, next) => {

  	try {

  		const check = await pool.select('id').from('userdata').where('userId', '=', req.user[0].userId).limit(1);

  		if (check.length === 0) {
  			req.kyc = 0;
  		}

  		if (check.length === 1) {
  			req.kyc = 1;
  		}

  		return next();

  	} catch (err) {

  		return res.status(500).json({
	        status: "failed",
	        message: `Unable to perform request`
	    });
  	}
});

const multerStorage = multerGoogleStorage.storageEngine({
	autoRety: true,
	bucket: process.env.BUCKET,
	projectId: process.env.PROJECT,
	maxRetries:2,
	destination:'kycuploads',
	acl:'publicRead',
	uniformBucketLevelAccess:true,
	keyFilename: `${__dirname}/../config/keys.json`,
	filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `${tokenGenerator()}.${ext}`);
    }
});

const multerFilter = (req, file, cb) => {

	const ext = path.extname(file.originalname);
	const allowed = ['.png', '.pdf'];

    if (allowed.includes(ext)){
        cb(null, true);
    }else{
        cb(new error('Please select a valid ID', 400), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {fileSize: 2000000}
});

exports.uploadKycPhoto = upload.single('id_photo');

exports.fixURL = (req, res, next) => {

	if (!req.file.linkUrl) {
		return next(new error('Please upload ID', 400));
	}

	req.body.id_url = req.file.linkUrl;

	next();
}

exports.uploadKyc = catchAsync ( async (req, res, next) => {

	if (req.kyc === 0) {

		const { bank_code, bank_account, bvn, dob, id_type, id_url, address, city, state, country, nationality } = req.body;

	  	try {

	  		const newDoc =  await pool("userdata").insert({ 
				userId:req.user[0].userId, 
				bank_code,
				bank_account,
				bvn,
				dob,
				id_type,
				id_url,
				address,
				city,
				state,
				country,
				nationality,
				created:getCurrentTime()
			});

	  		if (newDoc.length > 0) {

	  			return res.status(200).json({
			        status:"success",
			        message:"KYC successfully updated",
			    });
	  		}
	  	} catch (err) {
	  		return res.status(500).json({
		        status: "failed",
		        message: `Unable to perform request`
		    });
	  	}
	}

	return res.status(400).json({
        status: "failed",
        message: `KYC already uploaded`
    });
});