angular.module('userModule')
.factory('userObj', ['$http', 'state', function($http, $state){
	var userObj = {
		user: []
	};
	
	userObj.login = function(user){
		return $http.post('/user', user).then(function(res){
			if(res.data.problem){
				return;
			}
			else{
				angular.copy(res.data, userObj.user);
				$state.go('PC2');
			}
		});
	}
	
	userObj.signup = function(user){
		return $http.post('/user/signup', user).then(function(res){
			console.log("response for signup: " + res.data);
			angular.copy(res.data, userObj.user);
			$state.go('PC2');
		});
	}
	
	return userObj;
}]);