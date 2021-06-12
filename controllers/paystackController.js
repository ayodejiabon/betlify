const PayStack = require('paystack-node');
const catchAsync = require('../utils/catchAsync');
const error = require('../utils/appError');

const paystack = new PayStack(process.env.PAYSTACK_SECRET_KEY, process.env.NODE_ENV);

exports.resolveAccountNumber = (account, bank) => {
	return paystack.resolveAccountNumber({account_number:account,bank_code:bank});
};

exports.listBanks = currency => {
	return paystack.listBanks({currency:currency});
};

exports.chargeCard = data => {
	return paystack.chargeAuthorization(data);
};

exports.calcCharge = amount => {

	const charge = (0.015 * amount);

	let total;

	if (charge >= 2000) {

		total = 2000;

	}else{

		total = charge;
	}

	return total;
}