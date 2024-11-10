var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	username: String,
	password: String,
	admin: Boolean
});

module.exports = userSchema;