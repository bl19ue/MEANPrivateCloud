angular.module('userModule')
.factory('user', ['$http', '$state', '$location','$window', function($http, $state, $location, $window){
	var o = {
		user: []
	};
	
	o.login = function(user){
		console.log('in o.login');
		return $http.post('/login', user).then(function(res){
			
			console.log("Response data = " + res.data);
			console.log('res.data.type:' + res.data.type);
			if(!res.data.type){
				$scope.alertmessage = res.data.data;
			}
			else{
				angular.copy(res.data.data, o.user);
				console.log('user data in login ng '+ res.data.data.username);
				$state.go('dashboard');
				//$state.reload();

				//$window.location.reload();
			}
		})

	}
	
	o.signup = function(user){
		return $http.post('/signup', user).then(function(res){
			console.log("Response data = " + res.data);
			console.log('res.data.type:' + res.data.type);
			if(!res.data.type){
				$scope.alertmessage = res.data.data;
			}
			else{
				angular.copy(res.data.data, o.user);
				console.log("response for signup: " + res.data);
				$state.go('dashboard');
			}
			
		});
	}
	
	return o;
}]);