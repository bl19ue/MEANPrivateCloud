var mongoose = require('mongoose');

var InstanceSchema = new mongoose.Schema({
	name: String,
	type: String,
	cpu: {type: Number},
	ram: {type: Number},
	status: String,
	ipaddress: String,
	created_at: String,
	alarmCpu: {value:Number, flag:Boolean},
	alarmMemory: {value:Number, flag:Boolean},
	alarmDisk: {value:Number, flag:Boolean}
});

mongoose.model('Instance', InstanceSchema, 'Instance');