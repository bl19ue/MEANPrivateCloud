angular.module('userModule')
.controller('UserEntryCtrl', ['$scope', 'user', function($scope, user){
	
	$scope.loginUser = function(){
		console.log("in login");
		if($scope.username == '' || $scope.password == ''){
			return;
		}
		var msg = user.login({
			username: $scope.username,
			password: $scope.password
		});
		console.log("msg=" + msg);
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
			firstname: $scope.firstname,
			lastname: $scope.lastname,
			username: $scope.newusername,
			password: $scope.newpassword,
		});
		/*
		$scope.newusername = '';
		$scope.newpassword = '';
		$scope.newrepassword = '';
		*/
	};

}]);