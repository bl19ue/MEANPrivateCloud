angular.module('userModule')
	.factory('instance', ['$http', '$state', function($http, $state){
		var o = {
			instances: []
		};

		o.getAllVMs = function(username){
			console.log('username:' + username);
			return $http.get('/user/'+ username +'/vm/list').then(function(res){
				//console.log("Response data = " + res.data.data[0].name);
				console.log('res.data.type:' + res.data.type);

				if(!res.data.type){
					console.log('error on getting all VMs');
					return null;
				}
				else{
					angular.copy(res.data.data, o.instances);
					console.log('res.data.data: ' + res.data.data);
					return res.data.data;
				}
				console.log('found nothing');
				return null;
			});
		}


		o.startStop = function(thisinstance, user){
			console.log('in start with instance:' + thisinstance.name);
			var doWork;
			if(thisinstance.status == 'poweredOff'){
				doWork = 'start';
			}
			else{
				doWork = 'stop';
			}

			console.log('the do work is:' + doWork);

			return $http.post('/user/' + user.username + '/vm/' + thisinstance.name + '/' + doWork).then(function(res){
				console.log('res.data.type in start:' + res.data.type);
				if(!res.data.type){
					console.log('error on starting the vm:' + thisinstance.name);
					return null;
				}
				else{
					console.log('res.data.data in create: ' + res.data.data);
					o.instances.forEach(function(instance){
						if(instance.name == res.data.data.name){
							instance.status = res.data.data.status;
						}
					});
					return res.data.data;
				}
			});
		}

		o.delete = function(){

		}

		o.create = function(){
			
		}

		o.getStats = function(){

		}

		return o;
	}]);