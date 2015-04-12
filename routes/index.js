var express = require('express');
var router = express.Router();
var http = require('http');
var url = require('url');
var rest = require('restler');
var mongoose= require("mongoose");
var jwt = require("jsonwebtoken");
var q = require('q');

/*Get */
var UserSchema = mongoose.model('User');
var TemplateSchema = mongoose.model('Template');
var InstanceSchema = mongoose.model('Instance');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Welcome to Private Cloud'});

});

//This method calls a JAVA Spring Boot API running on localhost:8080
var performReqObject = {
	performReq : function(path,method,d){
		var deferred = q.defer();

		console.log('in perform request');
		if(method == 'get'){
			console.log('Get request with path=' + path);
			rest.get('http://localhost:8080'+ path, {timeout: 9000000}).on('complete', function(data){
				deferred.resolve(data);
			});
		}
		else{
			console.log('Post request with path=' + path);
			rest.postJson('http://localhost:8080'+ path, d, {timeout: 9000000}).on('complete', function(data){
				deferred.resolve(data);
			});	
		}

		return deferred.promise;

	}
}


//This method ensures authentication for secured api's
function ensureAuthorized(req, res, next) {
	var bearerToken;
	var bearerHeader = req.headers["authorization"];
	if (typeof bearerHeader !== 'undefined') {
		var bearer = bearerHeader.split(" ");
		bearerToken = bearer[1];
		req.token = bearerToken;
		next();
	} else {
		res.send(403);
	}
}

//This api redirects to user.ejs page
router.get('/user', function(req, res) {
	res.render('user', { title: 'User' });

});

//This api allows user to login. First it checks the username and password if it is blank then it returns Invalid Credentials
//If credentials are non blank then it searches for the username in User collection. If user is found then it authenticates the password.
router.post('/login',function(req,res){
	UserSchema.findOne({username: req.body.username, password: req.body.password}, function(err, user) {
		if (err) {
			res.json({
				type: false,
				data: "Error occured: " + err
			});
		} 
		else {
			if (user) {
				res.json({
					type: true,
					data: user,
					token: user.token
				}); 
			} 
			else {
				res.json({
					type: false,
					data: "Incorrect email/password"
				});    
			}
		}
	});
});

//This api adds a new user in User collection
router.post('/signup', function(req, res, next) {

	UserSchema.findOne({username: req.body.username, password: req.body.password}, function(err, user) {
		if (err) {
			console.log('err');
			res.json({
				type: false,
				data: "Error occured: " + err
			});
		} else {
			if (user) {
				console.log('exists');
				res.json({
					type: false,
					data: "User already exists!"
				});
			} else {
				console.log('new');
				var userModel = new UserSchema();

				userModel.username = req.body.username;
				userModel.password = req.body.password;
				userModel.firstname = req.body.firstname;
				userModel.lastname = req.body.lastname;

				userModel.save(function(err, user) {
					console.log('saving user');
					user.token = jwt.sign(user, 'team01');
					console.log('token = ' + user.token );
					user.save(function(err, user1) {
						console.log('saving user with token' + user1);
						res.json({
							type: true,
							data: user1,
							token: user1.token
						});
					});
				})
			}
		}
	});


});

//This api gives list of all VMs of user- 'username'
router.get('/user/:username/vm/list', function(req, res){

	var username = req.params.username;
	console.log('username in list: ' + username);
	UserSchema.findOne({'username': username}, function(err, user){
		console.log('user in find of list: ' + user);
		if(err){
			res.json({
				type: false,
				data: "Error occured: " + err
			});
		}
		if(!user){
			res.json({
				type: false,
				data: "User not found"
			});
		}
			
		var instancesName = user.instances;
		console.log('users instances: ' + user.instances);
		InstanceSchema.find({'name': {$in : instancesName}}, function(err, instances){
			if(err){
				res.json({
					type: false,
					data: "Error occured: " + err
				});
			}
			else{
				if(instances){
					console.log('instance name: ' + instances[0].name);
					res.json({
						type: true,
						data: instances
					});
				}
				else{
					res.json({
						type: false,
						data: "No instances found"
					});
				}
			}
		});
	});
});

//This api creates a VM for user- 'username'
router.post('/user/:username/vm/:vmname/create', function(req, res, next){
	console.log('username and vmname:' + req.params.username + " " + req.params.vmname);
	console.log('post body:' + req.body.vmName);

	var vmObject = {'vmName' : req.body.vmName};
	var myRequest = performReqObject.performReq('/vm/'+ req.params.vmname+ '/create', 'post', vmObject);

	myRequest.done(function(data){
		console.log(data);
		var instanceModel = new InstanceSchema(data);
		instanceModel.save(function(err, instance){
			if(err){
				res.json({
					type:false,
					data: "Could not save instance [in create] into db: " + err
				});
			}
			else{
				if(instance){
					UserSchema.findOne({username: req.params.username}, function(err, user){
						if(err){
							res.json({
								type:false,
								data: "Could not find this user [in create]: " + err
							});		
						}
						else{
							if(user){
								user.instances.push(data.name);
								user.save(function(err, user){
									if(err){
										res.json({
											type:false,
											data: "Instance data could not be saved into user" + err
										});			
									}
									else{
										res.json({
											type:true,
											data: instance
										});		
									}
								});
								
							}
							else{
								res.json({
									type:false,
									data: "Could not find this user [in create]: " + err
								});		
							}
						}
					});				
				}
				else{
					res.json({
						type:false,
						data: "No instance found with name: " + req.params.vmname
					});
				}
			}
		});
	});


});

//This api starts vm with vmId - id of user- 'username'
router.get('/user/:username/vm/:vmname/start', function(req, res){
	UserSchema.findOne({username: req.params.username, instances: req.params.vmname}, function(err, user){
		if(err){
			res.json({
				type:false,
				data: "Error occured: " + err
			});
		}
		else{
			if(user){
				var myRequest = performReqObject.performReq('/vm/'+ req.params.vmname+ '/start', 'get', null);

				myRequest.done(function(data){
					InstanceSchema.findOne({name: req.params.vmname}, function(err, instance){
						instance.status = 'poweredOn'
						instance.save(function(err, instance){
							if(err){
								res.json({
									type:false,
									data: "Could not save instance [in start] into db: " + err
								});
							}
							else{
								if(instance){
									res.json({
										type:true,
										data: instance
									});					
								}
								else{
									res.json({
										type:false,
										data: "No instance found [in start] with name: " + req.params.vmname
									});
								}
							}
						});
					});	
				});
			}
			else{
				res.json({
					type:false,
					data: "User not found [in start]"
				});					
			}
		}
	});

});

//This api stops vm with vmId - id of user- 'username'
router.get('/user/:username/vm/:vmname/stop', function(req, res){
	UserSchema.findOne({username: req.params.username, instances: req.params.vmname}, function(err, user){
		if(err){
			res.json({
				type:false,
				data: "Error occured: " + err
			});
		}
		else{
			if(user){
				var myRequest = performReqObject.performReq('/vm/'+ req.params.vmname+ '/stop', 'get', null);

				myRequest.done(function(data){
					InstanceSchema.findOne({name: req.params.vmname}, function(err, instance){
						instance.status = 'poweredOff'
						instance.save(function(err, instance){
							if(err){
								res.json({
									type:false,
									data: "Could not save instance [in stop] into db: " + err
								});
							}
							else{
								if(instance){
									res.json({
										type:true,
										data: instance
									});					
								}
								else{
									res.json({
										type:false,
										data: "No instance found [in stop] with name: " + req.params.vmname
									});
								}
							}
						});
					});	
				});
			}
			else{
				res.json({
					type:false,
					data: "User not found [in stop]"
				});					
			}
		}
	});
});

//This api gives stats of vm with vmId - id of user- 'username'
router.get('/user/:username/vm/:id/stats', ensureAuthorized, function(req,res){

	//	authenticateToken(req,res);

	UserSchema.findOne({token: req.token}, function(err, user){
		if(err){
			res.json({
				type:false,
				data: "Error occured: " + err
			});
		}
		else{
			performReq('/vm/'+ req.params.id+ '/stats', 'get').then(function(data){
				res.json({
					type: true,
					data: data
				});
			});

		}
	});

	//console.log(req.params.id);
	// var data = {
	// 	id: req.params.id,
	// 	VMname: req.params.VMname,
	// 	state : req.params.state,
	// 	cpu: req.params.cpu,
	// 	memory: req.params.memory
	// }


	//request.end();
});

router.get('/user/:username/vm/:vmname/status', function(req, res){
	UserSchema.findOne({username: req.params.username}, function(err, user){
		if(err){
			res.json({
				type:false,
				data: "Error occured: " + err
			});
		}
		else{
			console.log('found user, now requesting the status of this VM');
			var myRequest = performReqObject.performReq('/vm/'+ req.params.vmname+ '/status', 'get', null);

			myRequest.done(function(data){
				InstanceSchema.findOne({name: req.params.vmname}, function(err, instance){
					instance.status = data;
					instance.save(function(err, instance){
						if(err){
							res.json({
								type:false,
								data: "Could not save status into db: " + err
							});
						}
						else{
							if(instance){
								res.json({
									type:true,
									data: instance
								});					
							}
							else{
								res.json({
									type:false,
									data: "No instance found with name: " + req.params.vmname
								});
							}
						}
					});
				});

			});
		}
	});

});

module.exports = router;