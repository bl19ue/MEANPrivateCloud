var mongoose = require('mongoose');

var TemplateSchema = new mongoose.Schema({
	name: String,
	type: String,
	ram: {type: Number},
	cpu: {type: Number},
	storage: {type: Number}
});

mongoose.model('Template', TemplateSchema, 'Template');