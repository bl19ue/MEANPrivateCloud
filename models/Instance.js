var mongoose = require('mongoose');

var InstanceSchema = new mongoose.Schema({
	name: String,
	type: String,
	cpu: {type: Number},
	ram: {type: Number},
	status: String,
	created_at: String
});

mongoose.model('Instance', InstanceSchema, 'Instance');