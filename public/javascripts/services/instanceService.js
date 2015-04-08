angular.module('userModule')
.factory('instance', ['$http', '$state', function($http, $state){
	var o = {
		instances: [
			{
				name: 'Sumit VM',
				type: 'Ubuntu',
				cpu: 8,
				ram: 32,
				storage: 2,
				status: 'Started',
			},
			{
				name: 'Piyush VM',
				type: 'Windows',
				cpu: 2,
				ram: 12,
				storage: 2,
				status: 'Stopped',
			},
			{
				name: 'Vaibhav VM',
				type: 'Ubuntu',
				cpu: 18,
				ram: 22,
				storage: 22,
				status: 'Started',
			}
		]
	};

	o.create = function(){
		
	}

	o.delete = function(){
		
	}

	o.start = function(){

	}
	
	o.stop = function(){

	}

	o.getStats = function(){
	
	}
	
	return o;
}]);