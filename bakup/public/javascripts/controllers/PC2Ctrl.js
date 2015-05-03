angular.module('userModule')
	.directive('vmDetialsDirective', function() {
	return {
		restrict: 'E',
		link: function(scope, elm, attrs) {
			scope.saveInstance = function(instance) {
				console.log('k');
				elm.showModal();
			};
		}
	};
})
	.controller('PC2Ctrl', ['$scope', 'user', 'instance', 'PC2', function($scope, user, instance, PC2){


		console.log('user in PC2Ctrl:' + user.user.firstname);
		$scope.instances = PC2;



		$scope.saveThisInstance = function(instance){
			$scope.saveInstance(instance);
			//			$modal.open({
			//				templateUrl: 'vmdetails.html',
			//				controller: 'VMDetailsModalCtrl',
			//				size: 'lg',
			//				resolve: {
			//					thisinstance: function () {
			//						return instance;
			//					}
			//				}
			//			});
		}

		$scope.createVM = function(templateName){
			instance.create(templateName);
		}
	}])
	.controller('VMDetailsModalCtrl', ['$scope', 'user', 'instance', 'thisinstance', '$modalInstance', function($scope, user, instance, thisinstance, $modalInstance){
		console.log('instance name:' + thisinstance.name);
		$scope.thisinstance = thisinstance;

		$scope.startStop = function(){
			instance.startStop(thisinstance, user);
			$modalInstance.dismiss('cancel');
		}

		$scope.close = function(){
			$modalInstance.dismiss('cancel');
		}

	}])
	.controller('launchCtrl', ['$scope', function($scope){
		console.log('in launchCtrl');
	}]);


