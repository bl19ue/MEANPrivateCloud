var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	username: { type: String, required: true, index: { unique: true } },
	password: { type: String, required: true },
	firstname: String,
	lastname: String,
	instances: [{type: mongoose.Schema.Types.ObjectId, ref: 'Instance'}]
});


mongoose.model('User', UserSchema, 'User');