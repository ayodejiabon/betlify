const pool = require('../database/knex');
const catchAsync = require('../utils/catchAsync');
const error = require('../utils/appError');

exports.getPlans = catchAsync ( async (req, res, next) => {

  	try {
  		const plans = await pool.select('plan_id', 'name', 'description', 'daily_interest', 'duration', 'min_deposit', 'max_deposit', 'percentage').from('invest_plans').where('status', '=', '1');

  		return res.status(200).json({
	        status:"success",
	        data:plans
	    });
  	} catch (err) {
  		console.log(err);

  		return res.status(500).json({
	        status: "failed",
	        message: `Unable to perform request`
	    });
  	}
});