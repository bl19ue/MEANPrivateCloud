angular.module('userModule')
.controller('UserEntryCtrl', ['$scope', 'user', function($scope, user){
	
	$scope.loginUser = function(){
		console.log("in login");
		user.login({
			username: $scope.username,
			password: $scope.password
		});
		
		$scope.username = '';
		$scope.password = '';
	};
	
	$scope.signupUser = function(){
		console.log("in signup");
		if($scope.newpassword !== $scope.newrepassword){
			console.log('Password did not match');
			//Show incorrect the label
			return;
		}
		
		user.signup({
			username: $scope.newusername,
			password: $scope.newpassword
		});
		/*
		$scope.newusername = '';
		$scope.newpassword = '';
		$scope.newrepassword = '';
		*/
	};

}]);