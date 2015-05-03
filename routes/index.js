var express = require('express');
var router = express.Router();
var http = require('http');
var url = require('url');
var rest = require('restler');
var mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
var q = require('q');

/*Get */
var UserSchema = mongoose.model('User');
var TemplateSchema = mongoose.model('Template');
var InstanceSchema = mongoose.model('Instance');

/* GET home page. */
router.get('/', function(req, res) {
    //res.render('index', { title: 'Welcome to Private Cloud'});
    res.render('login', {
        title: 'Welcome to Private Cloud'
    });

});

router.get('/home', function(req, res) {
    //res.render('index', { title: 'Welcome to Private Cloud'});
    res.render('home', {
        title: 'Welcome to Private Cloud'
    });

});

//This method calls a JAVA Spring Boot API running on localhost:8080
var performReqObject = {
    performReq: function(path, method, d) {
        var deferred = q.defer();

        console.log('in perform request');
        if (method == 'get') {
            console.log('Get request with path=' + path);
            rest.get('http://localhost:8080' + path, {
                timeout: 9000000
            }).on('complete', function(data) {
                deferred.resolve(data);
            });
        } else {
            console.log('Post request with path=' + path);
            rest.postJson('http://localhost:8080' + path, d, {
                timeout: 9000000
            }).on('complete', function(data) {
                deferred.resolve(data);
            });
        }

        return deferred.promise;

    }
}

var reqElasticSearch = {		
	performReq: function(path, method, d) {		
		console.log('path=' + path);		
		var deferred = q.defer();		
		console.log('in elastic request');		
		if (method == 'get') {		
			console.log('Get request with path=' + path);		
			rest.get('http://localhost:8080' + path, {		
				timeout: 9000000		
			}).on('complete', function(data) {		
				deferred.resolve(data);		
			});		
		} 		
				
		else {		
			console.log('Post request to elastic search with path=' + path + "and d = " + d);		
			rest.postJson(path, d, {		
				timeout: 5000		
			}).on('complete', function(data) {		
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
    res.render('user', {
        title: 'User'
    });

});

//This api allows user to login. First it checks the username and password if it is blank then it returns Invalid Credentials
//If credentials are non blank then it searches for the username in User collection. If user is found then it authenticates the password.
router.post('/login', function(req, res) {
    console.log("Login API called!");
    UserSchema.findOne({
        username: req.body.username,
        password: req.body.password
    }, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                req.session.user = user;
                console.log("Login success with user =" + req.session.user.username);
                res.json({
                    type: true,
                    data: user,
                    token: user.token
                });
            } else {
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

    UserSchema.findOne({
        username: req.body.userName,
        password: req.body.password
    }, function(err, user) {
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
                console.log("data: " + req.body.userName);
                userModel.username = req.body.userName;
                userModel.password = req.body.password;
                userModel.firstname = req.body.firstName;
                userModel.lastname = req.body.lastName;
                userModel.instances = [];
                userModel.save(function(err, user) {
                    res.json({
                        type: true,
                        data: user
                    });
                })
            }
        }
    });
});

router.post('/signout', function(req, res) {
    try {
        console.log("signout api called Node.");
        req.session = null;
        res.json({
            type: true,
            data: "Sign Out successfull"
        });

    } catch (e) {
        console.log("Entering catch block: " + e);
    }
});
//This api gives list of all VMs of user- 'username'
router.get('/vm/list', function(req, res) {
    console.log('user in find of list: ' + req.session.user.username);
    UserSchema.findOne({
        'username': req.session.user.username
    }, function(err, user) {
        //console.log('user in find of list: ' + user);
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        }
        if (!user) {
            res.json({
                type: false,
                data: "User not found"
            });
        }

        var instancesName = user.instances;
        console.log('users instances: ' + user.instances);
        InstanceSchema.find({
            'name': {
                $in: instancesName
            }
        }, function(err, instances) {
            if (err) {
                res.json({
                    type: false,
                    data: "Error occured: " + err
                });
            } else {
                if (instances) {
                    //console.log('instance name: ' + instances[0].name);
                    res.json({
                        type: true,
                        data: instances
                    });
                } else {
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
router.post('/vm/:vmname/create', function(req, res, next) {
    console.log('username and vmname:' + req.session.user.username + " " + req.params.vmname);
    console.log('post body:' + req.body.vmName);

    //checking if instance with vmName is already present
    InstanceSchema.findOne({
        name: req.body.vmName
     }, function(err, instance) {
        if (instance) {
        	//if Instance found
        	console.log("Instance name conflict");
            res.json({
                type: false,
                data: "Instance name conflict"
            });
        } else {
        	//if Instance not found	
            var vmObject = {
                'vmName': req.body.vmName
            };
            var myRequest = performReqObject.performReq('/vm/' + req.params.vmname + '/create', 'post', vmObject);
            myRequest.done(function(data) {
                console.log(JSON.stringify(data));
                if (data.type=="false" || data == null || data == 'Error' || data === undefined) {
                	console.log(data.message);
                    res.json({
                        type: false,
                        data: data.message
                    });
                } else {
                    var instanceModel = new InstanceSchema(data);
                    instanceModel.alarmCpu.value = 0;
                    instanceModel.alarmMemory.value = 0;
                    instanceModel.alarmDisk.value = 0;
                    instanceModel.alarmCpu.flag = false;
                    instanceModel.alarmMemory.flag = false;
                    instanceModel.alarmDisk.flag = false;
                    instanceModel.save(function(err, instance) {
                        if (err) {
                            res.json({
                                type: false,
                                data: "Could not save instance [in create] into db: " + err
                            });
                        } else {
                            if (instance) {
                                UserSchema.findOne({
                                    username: req.session.user.username
                                }, function(err, user) {
                                    if (err) {
                                        res.json({
                                            type: false,
                                            data: "Could not find this user [in create]: " + err
                                        });
                                    } else {
                                        if (user) {
                                            user.instances.push(data.name);
                                            user.save(function(err, user) {
                                                if (err) {
                                                    res.json({
                                                        type: false,
                                                        data: "Instance data could not be saved into user" + err
                                                    });
                                                } else {
                                                    res.json({
                                                        type: true,
                                                        data: instance
                                                    });
                                                }
                                            });

                                        } else {
                                            res.json({
                                                type: false,
                                                data: "Could not find this user [in create]: " + err
                                            });
                                        }
                                    }
                                });
                            } else {
                                res.json({
                                    type: false,
                                    data: "No instance found with name: " + req.params.vmname
                                });
                            }
                        }
                    });
                }
            });
        }
    });
});

//This api starts vm with vmId - id of user- 'username'
router.get('/vm/:vmname/start', function(req, res) {

    UserSchema.findOne({
        username: req.session.user.username,
        instances: req.params.vmname
    }, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                var myRequest = performReqObject.performReq('/vm/' + req.params.vmname + '/start', 'get', null);

                myRequest.done(function(data) {
                    InstanceSchema.findOne({
                        name: req.params.vmname
                    }, function(err, instance) {
                        instance.status = 'poweredOn'
                        instance.save(function(err, instance) {
                            if (err) {
                                res.json({
                                    type: false,
                                    data: "Could not save instance [in start] into db: " + err
                                });
                            } else {
                                if (instance) {
                                    res.json({
                                        type: true,
                                        data: instance
                                    });
                                } else {
                                    res.json({
                                        type: false,
                                        data: "No instance found [in start] with name: " + req.params.vmname
                                    });
                                }
                            }
                        });
                    });
                });
            } else {
                res.json({
                    type: false,
                    data: "User not found [in start]"
                });
            }
        }
    });

});

//This api stops vm with vmId - id of user- 'username'
router.get('/vm/:vmname/stop', function(req, res) {
    console.log("Stopping :" + req.params.vmname);
    UserSchema.findOne({
        username: req.session.user.username,
        instances: req.params.vmname
    }, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                var myRequest = performReqObject.performReq('/vm/' + req.params.vmname + '/stop', 'get', null);

                myRequest.done(function(data) {
                    InstanceSchema.findOne({
                        name: req.params.vmname
                    }, function(err, instance) {
                        instance.status = 'poweredOff'
                        instance.save(function(err, instance) {
                            if (err) {
                                res.json({
                                    type: false,
                                    data: "Could not save instance [in stop] into db: " + err
                                });
                            } else {
                                if (instance) {
                                    res.json({
                                        type: true,
                                        data: instance
                                    });
                                } else {
                                    res.json({
                                        type: false,
                                        data: "No instance found [in stop] with name: " + req.params.vmname
                                    });
                                }
                            }
                        });
                    });
                });
            } else {
                res.json({
                    type: false,
                    data: "User not found [in stop]"
                });
            }
        }
    });
});

//This api gives stats of vm with vmId - id of user- 'username'
router.get('/vm/:id/stats', ensureAuthorized, function(req, res) {

    //	authenticateToken(req,res);

    UserSchema.findOne({
        token: req.token
    }, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            performReq('/vm/' + req.params.id + '/stats', 'get').then(function(data) {
                res.json({
                    type: true,
                    data: data
                });
            });
        }
    });
});

router.get('/vm/:vmname/status', function(req, res) {
    UserSchema.findOne({
        username: req.session.user.username
    }, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            console.log('found user, now requesting the status of this VM');
            var myRequest = performReqObject.performReq('/vm/' + req.params.vmname + '/status', 'get', null);

            myRequest.done(function(data) {
                InstanceSchema.findOne({
                    name: req.params.vmname
                }, function(err, instance) {
                    instance.status = data;
                    instance.save(function(err, instance) {
                        if (err) {
                            res.json({
                                type: false,
                                data: "Could not save status into db: " + err
                            });
                        } else {
                            if (instance) {
                                res.json({
                                    type: true,
                                    data: instance
                                });
                            } else {
                                res.json({
                                    type: false,
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

router.get("/vm/:vmname/statistics", function(req, res) {
    var myRequest = performReqObject.performReq('/vm/' + req.params.vmname + '/statistics', 'get', null);
    myRequest.done(function(data) {
        res.json({
            type: true,
            data: data
        });
    });
});

router.get("/vm/:vmname/vmStats", function(req, res) {
	console.log("Getting vmStats")
	InstanceSchema.findOne({name: req.params.vmname}, function(err, instance) {
		//console.log(instance);
		if(err){
			console.log("Error searching VM: " + err);
		 res.json({
                type: false,
                data: "Error searching VM: " + err
            });
		}else{
			if(instance){
				console.log("Sending instance: " + instance);
				res.json({
                    type: true,
                    data: instance
                });
			}else{
				console.log("No instance found with name: " + req.params.vmname);
				res.json({
					type: false,
                    data: "No instance found with name: " + req.params.vmname
                });
			}
		}
	});
});

router.post("/vm/:vmname/alarm/update", function(req, res) {
	console.log("Updating Alarm for " +  req.params.vmname);

	UserSchema.findOne({
        username: req.session.user.username,
        instances: req.params.vmname
    }, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
            	console.log("User found");
                InstanceSchema.findOne({name: req.params.vmname}, function(err, instance) {
                	if(err){
                		res.json({
                            type: false,
                            data: "No instance found [in start] with name: " + req.params.vmname
                        });
                	}else{
                		if (instance) {
	                	console.log("Instance found... Updating");
	                	instance.alarmCpu.value = req.body.alarmCpuValue;
	                    instance.alarmMemory.value = req.body.alarmMemoryValue;
	                    instance.alarmDisk.value = req.body.alarmDiskValue;
	                    instance.alarmCpu.flag = req.body.alarmCpuFlag;
	                    instance.alarmMemory.flag = req.body.alarmMemoryFlag;
	                    instance.alarmDisk.flag = req.body.alarmDiskFlag;
	                    instance.save(function(err, instance) {
	                        if (err) {
	                            res.json({
	                                type: false,
	                                data: "Could not save instance [in start] into db: " + err
	                            });
	                        } else {
	                            if (instance) {
	                            	console.log("Instance Updated");
	                                res.json({
	                                    type: true,
	                                    data: instance
	                                });
	                            } else {
	                                res.json({
	                                    type: false,
	                                    data: "Could not update instance with name: " + req.params.vmname
	                                });
	                            }
	                        }
	                    });
	                	}
	                }
                });
            } else {
                res.json({
                    type: false,
                    data: "User not found [in start]"
                });
            }
        }
    });


});

/*********************************************ALARM START******************************************/

router.post('/vm', function(req, res){
	console.log('/vm');
	var ip = req.body.ip;
	console.log(req.body);
	generateStats(ip).then(function(stats){
		console.log("statsss=" + stats);
		res.json({
			type: true,
			data: stats
		});
	}).fail(function(err){
		res.json({
			type: false,
			data: err
		});
	});
	
});

var generateStats = function(ip){
	//TODO get details of the VM
	
	var url = 'http://localhost:9200//project2/vm/_search';
	
	var data = {
		"query": {
			"filtered": {
				"query": {
					"query_string": {
						"query": ip
					}
				}
			}
		}
	}
	console.log("ip=" + ip);
	
	var stats = {
		time: [],
		mem: [],
		cpu: [],
		net: [],
		disk: []
	};
	
	var deferred = q.defer();
	
	reqElasticSearch.performReq('http://localhost:9200//project2/vm/_search', 'post', data).then(function(statsRow){
		
//		for(var i=0;i<statsRow.hits.hits.length;i++){
//			console.log(statsRow.hits.hits[i]._source.date);
//			stats.time.push(statsRow.hits.hits[i]._source.date);
//			stats.mem.push(statsRow.hits.hits[i]._source.mem);
//			stats.cpu.push(statsRow.hits.hits[i]._source.cpu);
//			stats.net.push(statsRow.hits.hits[i]._source.net);
//			stats.disk.push(statsRow.hits.hits[i]._source.disk);
//			//console.log("sd" + stats.time);
//		}
		
		statsRow.hits.hits.forEach(function(row){
			console.log(row._source.date);
			stats.time.push(row._source.date);
			stats.mem.push(row._source.mem);
			stats.cpu.push(row._source.cpu);
			stats.net.push(row._source.net);
			stats.disk.push(row._source.disk);
			console.log("sd" + stats.time);
		});
		
		deferred.resolve(stats);
		
	});
	
	return deferred.promise;
}

/*********************************************ALARM END******************************************/
module.exports = router;