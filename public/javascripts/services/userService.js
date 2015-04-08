angular.module('userModule')
.factory('user', ['$http', '$state', '$location','$window', function($http, $state, $location, $window){
	var o = {
		user: []
	};
	
	o.login = function(user){
		console.log('in o.login');
		return $http.post('/login', user).then(function(res){
			
			console.log("Response data = " + res.data.error);
			
			if(res.data.error != null){
				return res.data.error;
			}
			else{
				angular.copy(res.data, o.user);
				$location.url('/PC2');
				$window.location.href = "/PC2";
				$window.location.reload();
			}
		})

	}
	
	o.signup = function(user){
		return $http.post('/signup', user).then(function(res){
			console.log("response for signup: " + res.data);
			angular.copy(res.data, o.user);
			$state.go('PC2');
		});
	}
	
	return o;
}]);