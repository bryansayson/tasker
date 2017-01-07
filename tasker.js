var tasker = angular.module('Tasker', ['ngRoute']);

tasker.controller('taskController', function($scope, $http) {
  $http.get("http://interview.lenderprice.com:7070/api/jobs")
  .then(function(response) {
      $scope.tasks = response.data;
      console.log($scope.tasks);
  });
});

tasker.controller('createTasksController', function($scope, $http) {
  
})

tasker.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/tasks', {
      templateUrl : 'pages/tasks.html',
      controller  : 'taskController'
    })
    .when('/create', {
      templateUrl : 'pages/create.html',
      controller  : 'createTasksController'
    })
    .when('/assignees', {
      templateUrl : 'pages/assignees.html',
      controller  : 'taskController'
    });
    $locationProvider.html5Mode(true);
});

