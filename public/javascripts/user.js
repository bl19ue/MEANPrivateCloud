angular.module('userModule', ['ui.router', 'ngDialog'])
.config(['$stateProvider', '$urlRouterProvider',  function($stateProvider, $urlRouterProvider){
	$stateProvider
	.state('login', {
		url: '/login',
		templateUrl: '/login.html',
		controller: 'UserEntryCtrl'
	})
	.state('PC2', {
		url: '/PC2',
		templateUrl: '/PC2.html',
		resolve: {
			
			PC2: ['instance', 'user', function(instance, user){
				
				console.log('user in resolve:' + user.user.username);
				
				var instances = instance.getAllVMs('ken');
				
				console.log('instances in resolve:' + instances.name);
				
				return instances;
			}]
		},
		controller: 'PC2Ctrl',
	});
	
	$urlRouterProvider.otherwise('login');
	
}]);