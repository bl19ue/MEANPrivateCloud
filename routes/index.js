var express = require('express');
var router = express.Router();
var http = require('http');
var url = require('url');
/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Express' });
	
});

router.get('/vm/:id', function(req, res){
	console.log(req.params.id);
	var options = {
		host: 'localhost',
		port: 8080,
		path: '/vm/' + req.params.id,
		method: 'GET'
	};
	
	console.log(options);
	
	http.request(options, function(response) {
		console.log('STATUS: ' + response.statusCode);
		console.log('HEADERS: ' + JSON.stringify(response.headers));
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			res.type('text/plain');
			res.send(chunk);
		});
	}).end();
	
});

module.exports = router;
