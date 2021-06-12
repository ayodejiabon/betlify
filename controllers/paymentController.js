const pool = require('../database/knex');
const catchAsync = require('../utils/catchAsync');
const { calcCharge } = require('../controllers/paystackController');
const { tokenGenerator, getCurrentTime, generateReference } = require('../utils/helpers');
const error = require('../utils/appError');

exports.createOrder = catchAsync ( async (req, res, next) => {

	if (req.kyc === 1) {

	  	try {

	  		const { plan_id, amount, min_deposit, max_deposit, card_token } = req.body;

			if (amount < min_deposit || amount > max_deposit) {
				return next(new error(`Amount must be between ${min_deposit} and ${max_deposit}`, 400));
			}

			const charge = calcCharge(amount);

			const ref_code = generateReference().toUpperCase();

			const get_user = await pool.select("access.email", "registration.name")
			.from("access")
			.leftJoin("registration", "access.userId", "registration.userId")
			.where("access.userId", "=", req.user[0].userId)
			.limit(1);


			const { email, name } = get_user[0];

			let namesplit = name.split(' ');

			const lastname = namesplit[0];
			const firstname = namesplit[1];

			const create = await pool("payments").insert({
				userId:req.user[0].userId,
				email,
				plan_id,
				ref_code,
				amount,
				charge,
				created:getCurrentTime()
			});

			console.log(amount + charge)

			if (create.length > 0) {

					return res.status(200).json({
			        status:"success",
			       	data: {
			       		key:process.env.PAYSTACK_PUBLIC_KEY,
			       		reference:ref_code,
			       		email,
			       		lastname,
			       		firstname,
			       		currency:'NGN',
			       		amount:(amount + charge) * 100
			       	},
			    });
			}

	  	} catch (err) {

	  		console.log(err);

	  		return res.status(500).json({
		        status: "failed",
		        message: `Unable to perform request`
		    });
	  	}
	}

	return res.status(400).json({
        status: "failed",
        message: `Please upload KYC data before making order`
    });
});