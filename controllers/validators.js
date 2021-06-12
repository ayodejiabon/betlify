const { body, validationResult } = require('express-validator');
const pool = require('../database/knex');
const catchAsync = require('../utils/catchAsync');
const error = require('../utils/appError');

exports.signupvalidator = [
  body('name').trim().escape().not().isEmpty()
    .withMessage('Full name is required')
    .matches(/([A-Za-z]{1})([A-Za-z]+)(\s)([A-Za-z]{1})([A-Za-z]+){1}/)
    .withMessage('Please provide your valid full name')
    .bail(),
  body('email', 'Invalid email address').trim().not().isEmpty().exists().isEmail().normalizeEmail().bail(),
  body('phone')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Phone number is required')
    .isLength({min:11,max:11})
    .withMessage('Invalid NG phone number')
    .matches(/^080/,/^070/,/^090/,/^081/)
    .withMessage('Invalid NG phone number'),
  body('password').trim().escape().not().isEmpty()
    .withMessage('password is required')
    .isLength({min:8})
    .withMessage('password must be at least 8 characters long')
    .matches(/^.*(?=.{6,})(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/)
    .withMessage('password must contain a number and an uppercase letter')
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = [];
      errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
      return res.status(422).json({status:'failed',message:'All signup data is required',errors:extractedErrors});
    }
    next();
  }
]

exports.emailValidator = [
  body('email', 'Invalid email address').trim().not().isEmpty().exists().isEmail().normalizeEmail().bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = [];
      errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
      return res.status(422).json({status:'failed',message:'Email address is required',errors:extractedErrors});
    }
    next();
  }
]

exports.loginValidator=[
  body('email', 'Invalid email address').trim().not().isEmpty().exists().isEmail().normalizeEmail().bail(),
  body('password', 'Invalid password').trim().escape().not().isEmpty().isLength({min:8}).matches(/^.*(?=.{6,})(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/).bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = [];
      errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
      return res.status(422).json({status:'failed',message:'Please provide email and password',errors:extractedErrors});
    }
    next();
  }
]

exports.OTPvalidator=[
  body('otp').trim().not().isEmpty().exists().matches(/^[0-9]{1,6}$/).withMessage('Invalid otp').bail(),
  body('token')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Token is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = [];
      errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
      return res.status(422).json({status:'failed',message:'Please provide otp',errors:extractedErrors});
    }
    next();
  }
]

exports.planValidator=[
  body('plan_id').trim().not().isEmpty().withMessage('Plan is required').exists().isNumeric().withMessage('Invalid plan')
  .custom((value, { req }) => {
    return (pool.select('min_deposit','max_deposit').from('invest_plans').where('plan_id', '=', value).limit(1)).then(user => {
      if (user.length === 0) {
        return Promise.reject('Invalid plan_id');
      }else{
        req.body.min_deposit = user[0].min_deposit;
        req.body.max_deposit = user[0].max_deposit;
      }
    });
  }),
  body('amount')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Amount is required')
    .isNumeric().withMessage('Please provide a valid amount').bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = [];
      errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
      return res.status(422).json({status:'failed',message:'Please provide all order details',errors:extractedErrors});
    }
    next();
  }
]

exports.accountResolve=[
  body('account_no').trim().not().isEmpty().withMessage('Account number is required').exists().isNumeric().isLength({min:10,max:10}).withMessage('Invalid account number').bail(),
  body('bank_code').trim().not().isEmpty().withMessage('Bank code is required').isNumeric().exists().bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = [];
      errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
      return res.status(422).json({status:'failed',message:'Please provide account details',errors:extractedErrors});
    }
    next();
  }
]

exports.KYCData=[
  body('bank_account').trim().not().isEmpty().withMessage('Account number is required').isNumeric().withMessage('Invalid account number').exists().isLength({min:10,max:10}).withMessage('Invalid account number').bail(),
  body('bank_code').
  trim().not().isEmpty().withMessage('Bank code is required').isNumeric().withMessage('Invalid bank code').exists().bail(),
  body('dob')
  .trim().not().isEmpty().withMessage('DOB is required').isDate().withMessage('Valid date of birth is required'),
  body('bvn')
  .trim().not().isEmpty().withMessage('BVN is required').isNumeric().withMessage('Invalid BVN').exists().isLength({min:11,max:11}).withMessage('Invalid BVN').bail(),
  body('id_type')
  .trim().not().isEmpty().withMessage('ID type is required').exists()
  .isIn(['nimc','drivers_license','passport','voters_card']).withMessage('Invalid id type').bail(),
  body('id_url')
  .trim().not().isEmpty().withMessage('ID is required').exists().
  isURL({protocols:['https'],require_protocol:true}).withMessage('Please upload ID').bail(),
  body('address').trim().not().isEmpty().withMessage('Address is required'),
  body('city').trim().not().isEmpty().withMessage('Address city is required'),
  body('state').trim().not().isEmpty().withMessage('Address state is required'),
  body('country').trim().not().isEmpty().withMessage('Address state is required'),
  body('nationality').trim().not().isEmpty().withMessage('nationality is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = [];
      errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
      return res.status(422).json({status:'failed',message:'Please provide all kyc data',errors:extractedErrors});
    }
    next();
  }
]

exports.passwordMatch=[
  body('password').trim().escape().not().isEmpty()
    .withMessage('password is required')
    .isLength({min:8})
    .withMessage('password must be at least 8 characters long')
    .matches(/^.*(?=.{6,})(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/)
    .withMessage('password must contain a number and an uppercase letter')
    .bail(),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw 'passwords do not match';
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = [];
      errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
      return res.status(422).json({status:'failed',message:'Please provide all reset details',errors:extractedErrors});
    }
    next();
  }
]