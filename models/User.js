var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	instances: [{type: mongoose.Schema.Types.ObjectId, ref: 'Instance'}]
});

mongoose.model('User', UserSchema, 'User');