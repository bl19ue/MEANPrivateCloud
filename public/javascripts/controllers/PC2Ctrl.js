angular.module('userModule')
.controller('PC2Ctrl', ['$scope', 'user', 'instance', function($scope, user, instance){
	$scope.instances = instance.instances;
	$scope.saveThisInstance = function(instance){
		console.log(instance);
		$scope.thisinstance = instance;
		$('#vmDetails').showModal();

	}
}]);