angular.module('userModule', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider',  function($stateProvider, $urlRouterProvider){
	$stateProvider
	.state('login', {
		url: '/login',
		templateUrl: '/login.html',
		controller: 'UserEntryCtrl'
	})
	.state('PC2', {
		url: '/pc2',
		templateUrl: '/pc2.html',
		controller: 'PC2Ctrl'
	});
	
	$urlRouterProvider.otherwise('login');
	
}]);