const express = require('express');
const ratelimit = require('express-rate-limit');
const { 
	signupvalidator, 
	emailValidator, 
	loginValidator, 
	OTPvalidator, 
	forgotPassword, 
	passwordMatch, 
	accountResolve,
	KYCData,
	planValidator
} = require('../controllers/validators');

const authcontroller = require('../controllers/authController');
const kycController = require('../controllers/kycController');
const paymentsController = require('../controllers/paymentController');

const router = express.Router();

const limiter = ratelimit({max: 50, windowMs: 60 * 60 * 1000, message: 'Please try again in an hour'});

const sizelimit = express.json({limit: '10Kb'});

router.post('/signup', limiter, sizelimit, signupvalidator, authcontroller.signup);
router.put('/resend', limiter, sizelimit, emailValidator, authcontroller.resend);
router.post('/validate', limiter, sizelimit, OTPvalidator, authcontroller.validateOTP);
router.post('/login', limiter, sizelimit, loginValidator, authcontroller.login);
router.post('/forgotpassword', limiter, sizelimit, emailValidator, authcontroller.forgotPassword);
router.patch('/resetpassword', limiter, sizelimit, passwordMatch, OTPvalidator, authcontroller.resetPassword);


router.use(authcontroller.checkAuthentication);
router.use(authcontroller.checkActive);

router.post('/resolve_account', accountResolve, kycController.resolvebank);
router.get('/list_banks', kycController.listBanks);
router.post('/search_address', kycController.searchAddress);
router.post('/decode_address', kycController.decodeAddress);


router.post('/uploadkyc', kycController.checkKyc, kycController.uploadKycPhoto, kycController.fixURL, KYCData, kycController.uploadKyc);

router.post('/createorder', kycController.checkKyc, planValidator, paymentsController.createOrder);
 
router.post('/dashboard', authcontroller.dashboard);

module.exports = router;