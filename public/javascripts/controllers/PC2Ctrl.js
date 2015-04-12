angular.module('userModule')
.controller('PC2Ctrl', ['$scope', 'user', 'PC2', 'ngDialog', function($scope, user, PC2, ngDialog){
	
	
	console.log('user in PC2Ctrl:' + user.user.firstname);
	$scope.instances = PC2;
	
	
	
	$scope.saveThisInstance = function(instance){
		console.log('instance:' + instance);
		$scope.thisinstance = instance;
		ngDialog.open({
			template: 'vmdetails',
			controller: 'PC2Ctrl'
		});
		//$('#vmDetails').showModal();
	}
}]);

