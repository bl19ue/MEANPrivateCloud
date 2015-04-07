var express = require('express');
var router = express.Router();
var http = require('http');
var url = require('url');
var UserSchema = require('./models/User');
var rest = require('./restler');
var mongoose= require("mongoose");


/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Express' });
	
});

router.post('/signup', function(req, res, next) {
	var user = new UserSchema(req.body);

	user.save(function(err, user){
		if(err) { return next(err); }
		res.json(user);
	})
  });


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


function performReq(path,method,d){
	//var dataString = JSON.stringify(data);
  	//var headers = {};

	var req = rest.method('http://localhost:8080'+ path, {data: d}).on('complete', function(data){
		console.log(data);
	});

  });
  req.end();
  req.on('error', function(e) {
    console.error(e);
});
}

router.get('/vm/:id/VMlist', function(req, res){
	var id = req.params.id;
	console.log(req.params.id);
	
	var db = req.db;
	var collection= db.get('VM');

	var d = collection.find({},{}, function(e, documents)
	{

		res.render('VMlist',{ "VMlist" :documents});

	});


	var reqGet = performReq('/vm/' + req.params.id +'/VMlist','get',d);
	
	reqGet.end();
});

router.post('/vm/:id/createVM', function(req, res, next){
	console.log(req.params.id);
	var id = req.params.id;
	var create = new createVM(req.body);

	create.save(function(err, create){
		if(err) {return next(err);}
		console.log("VM successfully created");
		res.send(create);
	});

});


router.get('/vm/:id/start', function(req, res){
	console.log(req.params.id);

	var data = {
		id: req.params.id,
		VMname: req.params.VMname
	};

	var request = performReq('/vm/'+ req.params.id + 'start', 'get', data);

	request.end();
});

router.get('/vm/:id/stop', function(req, res){
	console.log(req.params.id);
	var data = {
		id: req.params.id,
		VMname: req.params.VMname
	};
	var request = performReq('/vm/'+ req.params.id + 'stop', 'get', data);
	request.end();
});

router.get('/vm/:id/stats', function(req,res){
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
