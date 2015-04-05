var mongoose = require('mongoose');

var InstanceSchema = new mongoose.Schema({
	instance_id: String,
	instance_name: String,
});

mongoose.model('Instance', InstanceSchema, 'Instance');