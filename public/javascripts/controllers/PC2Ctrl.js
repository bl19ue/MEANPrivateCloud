angular.module('userModule')
.controller('PC2Ctrl', ['$scope', 'user', 'instance', function($scope, user, instance){
	$scope.instances = instance.instances;
	console.log(instance.instances[0].name);
	console.log(instance.instances[1].name);
	console.log(instance.instances[2].name);
	console.log(instance.instances[0].type);
}]);