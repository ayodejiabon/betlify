const fs = require('fs');
const axios = require('axios');

const maps_api = axios.create({baseURL:process.env.GOOLE_MAPS_API_URL});

exports.findAddress = address => {
	return maps_api.get(`/place/autocomplete/json?input=${address}&key=${process.env.MAP_API_KEY}&sessiontoken=${Math.floor(Math.random() * 1000000000)}`);
};

exports.decodeAddress = place_id => {
	return maps_api.get(`/place/details/json?place_id=${place_id}&key=${process.env.MAP_API_KEY}`);
};


