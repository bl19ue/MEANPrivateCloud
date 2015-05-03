angular.module('userModule', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider',  function($stateProvider, $urlRouterProvider){
	$stateProvider
	.state('login', {
		url: '/login',
		templateUrl: '/login.html',
		controller: 'UserEntryCtrl'
	})
	.state('dashboard', {
		url: '/dashboard',
		templateUrl: '/dashboard.html',
		resolve: {
			
			PC2: ['instance', 'user', function(instance, user){
				
				console.log('user in resolve:' + user.user.username);
				
				var instances = instance.getAllVMs('ken');
				
				console.log('instances in resolve:' + instances.name);
				
				return instances;
			}]
		},
		controller: 'PC2Ctrl',
	})
	.state('launch', {
		url: '/launch',
		templateUrl: '/launch.html',
		controller: 'launchCtrl'
	});
	
	$urlRouterProvider.otherwise('login');
	
}]);