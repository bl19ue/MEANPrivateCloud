angular.module('userModule')
	.controller('PC2Ctrl', ['$scope', 'user', 'instance', 'PC2', function($scope, user, instance, PC2){


		console.log('user in PC2Ctrl:' + user.user.firstname);
		$scope.instances = PC2;

		$scope.createVM = function(templateName){
			instance.create(templateName, user.username, $scope.newVMName);
		}
		
		$scope.startStop = function(instance){
			instance.startStop(instance, user);
		}

//		$scope.saveThisInstance = function(instance){
//
//			//			$modal.open({
//			//				templateUrl: 'vmdetails.html',
//			//				controller: 'VMDetailsModalCtrl',
//			//				size: 'lg',
//			//				resolve: {
//			//					thisinstance: function () {
//			//						return instance;
//			//					}
//			//				}
//			//			});
//		}

//		$scope.createVM = function(templateName){
//			instance.create(templateName);
//		}
	}]);


