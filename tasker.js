var tasker = angular.module('Tasker', ['ngRoute']);

tasker.controller('taskController', function($scope, $http) {
  $scope.grabTasks = function() {
    $http.get("http://interview.lenderprice.com:7070/api/jobs")
      .then(function(response) {
          $scope.tasks = response.data;
      });
  }
  $scope.grabTasks();
});

tasker.controller('createTaskController', function($scope, $http) {
  $scope.submitTask = function() {
    var req = {
      method: 'POST',
      url: 'http://interview.lenderprice.com:7070/api/jobs',
      data: {summary: $scope.formSummary, status: $scope.formStatus}
    }
    $http(req).then(function(response) {
      console.log(response);
    });
    $scope.formSummary = " ";
    $scope.formStatus = " ";
    $scope.grabTasks();
  }
})

tasker.controller('assigneeController', function($scope, $http) {
  $scope.grabAssignees = function() {
    $http.get("http://interview.lenderprice.com:7070/api/assignee")
      .then(function(response) {
        $scope.assignees = response.data;
        console.log(response.data);
      });
    }
    $scope.grabAssignees();
});

tasker.controller('createAssigneeController', function($scope, $http) {
  $scope.submitAssignee = function() {
    var req = {
      method: 'POST',
      url: 'http://interview.lenderprice.com:7070/api/assignee',
      data: {name: $scope.formAssigneeName}
    }
    $http(req).then(function(response) {
      console.log(response);
    });
    $scope.formAssigneeName = " ";
  }
})


tasker.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/tasks', {
      templateUrl : 'pages/tasks.html',
      controller  : 'taskController'
    })
    .when('/assignees', {
      templateUrl : 'pages/assignees.html',
      controller  : 'assigneeController'
    });
    $locationProvider.html5Mode(true);
});

