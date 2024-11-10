var mongoose = require('mongoose');

var itemSchema = mongoose.Schema({
	name: String,
	count: Number,
	singlePrice: Number
});

module.exports = itemSchema;
