angular.module('userModule')
.factory('user', ['$http', '$state', function($http, $state){
	var o = {
		user: []
	};
	
	o.login = function(user){
		return $http.post('/user', user).then(function(res){
			if(res.data.problem){
				return;
			}
			else{
				angular.copy(res.data, o.user);
				$state.go('PC2');
			}
		});
	}
	
	o.signup = function(user){
		return $http.post('/user/signup', user).then(function(res){
			console.log("response for signup: " + res.data);
			angular.copy(res.data, o.user);
			$state.go('PC2');
		});
	}
	
	return o;
}]);