angular.module('userModule')
.controller('UserEntryCtrl', ['$scope', 'userObj', function($scope, userObj){
	$scope.loginUser = function(){
		console.log("in login");
		userObj.login({
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
		
		userObj.signup({
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