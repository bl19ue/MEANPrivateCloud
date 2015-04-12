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


		o.create = function(){

		}

		o.delete = function(){

		}

		o.start = function(){

		}

		o.stop = function(){

		}

		o.getStats = function(){

		}

		return o;
	}]);