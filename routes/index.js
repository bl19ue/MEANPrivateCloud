var express = require('express');
var router = express.Router();
var http = require('http');
var url = require('url');
var rest = require('restler');
var mongoose= require("mongoose");

/*Get */
var UserSchema = mongoose.model('User');
var Template = mongoose.model('Template');
var Instance = mongoose.model('Instance');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Welcome to Private Cloud'});

});

//This method calls a JAVA Spring Boot API running on localhost:8080
function performReq(path,method,d){
	
	var req = rest.method('http://localhost:8080'+ path, {data: d}).on('complete', function(data){
		console.log(data);
	});


	req.end();
	
	req.on('error', function(e) {
		console.error(e);
	});
}


//This api redirects to user.ejs page
router.get('/user', function(req, res) {
	res.render('user', { title: 'User' });

});

//This api adds a new user in User collection
router.post('/signup', function(req, res, next) {
	var user = new UserSchema(req.body);
	var username = req.params.username;

	UserSchema.findOne({'username': username}, function(err, username){
		if (err) throw err;
		else
			console.log(username+" Already Exists");
	});

	user.save(function(err, user){
		if(err) { return next(err); }
		res.json(user);
	})
});

//This api allows user to login. First it checks the username and password if it is blank then it returns Invalid Credentials
//If credentials are non blank then it searches for the username in User collection. If user is found then it authenticates the password.
router.post('/login',function(req,res){
	var username = req.body.username;
	var password = req.body.password;

	if (username == '' || password == '') {
		res.status(401);
		res.json({
			"status": 401,
			"message": "Invalid credentials"
		});
		return;
	}

	db.userModel.findOne({username: username}, function (err, user) {
		if (err) {
			console.log(err);
			return res.send(401);
		}

		if (!user){
			return res.send("Username not found");
		}

		if (user.password != password){
			return res.send("Try again");
		}
		else {
			return res.send(user);
		}
	});
});


//This api gives list of all VMs of user- 'username'
router.get('/user/:username/vm/list', function(req, res){
	
	var username = req.body.username;
	
	var d = UserSchema.findOne({'username': username}, function(err, username){
				
				var instances = username.instances
				
				Instance.find({'_id': {$in: instances}}, function(err, instance_id){
				
					var ids = [] ;
				
					for(var i =0; i< instances.length; i++){
					
                    	ids.push(username.instances.instance_id);
                	}
				console.log(ids);
			return ids;
		});
	});
	var reqGet = performReq('/vm/' + req.params.id +'/VMlist','get',d);
	reqGet.end();
});

//This api creates a VM for user- 'username'
router.post('/user/:username/vm/create', function(req, res, next){
	console.log(req.params.id);
	var id = req.params.id;
	var name = ['Ubuntu','Windows'] 

	var template_name = Template.find({'name': {$in: name} }).toArray( function(err, name){
		if (err) throw err;
  		console.log(name);
  		return (name);
	});

	var reqGet = performReq('/vm/'+ req.params.name+ '/create', 'post', template_name);
	reqGet.end();

});

//This api starts vm with vmId - id of user- 'username'
router.get('/user/:username/vm/:id/start', function(req, res){
	console.log(req.params.id);
	username = req.params.username;

	var data = UserSchema.find({'username': username}, function(err, username){
				var id = username.instances;
				Instance.find({'_id': {$in: id}}).toArray( function(err, id){
					if (err) throw err;
				return (id);
			});
	});

	var reqGet = performReq('/vm/'+ req.params.id + '/start', 'get', data);

	reqGet.end();
	
});

//This api stops vm with vmId - id of user- 'username'
router.get('/user/:username/vm/:id/stop', function(req, res){
	console.log(req.params.id);
	username = req.params.username;

	var data = UserSchema.find({'username': username}, function(err, username){
				var id = username.instances;
				Instance.find({'_id': {$in: id}}).toArray( function(err, name){
					if (err) throw err;
				return (name);
			});
	});
	var request = performReq('/vm/'+ req.params.id + 'stop', 'get', data);
	request.end();
});

//This api gives stats of vm with vmId - id of user- 'username'
router.get('/user/:username/vm/:id/stats', function(req,res){
	console.log(req.params.id);
	var data = {
		id: req.params.id,
		VMname: req.params.VMname,
		state : req.params.state,
		cpu: req.params.cpu,
		memory: req.params.memory
	}

	var request = performReq('/vm/'+ req.params.id+ 'stats', 'get', data);
	request.end();
});
module.exports = router;