var mongoose = require('mongoose');

var InstanceSchema = new mongoose.Schema({
	_id: String,
	name: String,
	type: String,
	cpu: {type: Number},
	ram: {type: Number},
	storage: {type: Number},
	status: String,
	created_at: String
});

mongoose.model('Instance', InstanceSchema, 'Instance');