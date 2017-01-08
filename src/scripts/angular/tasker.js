var app = angular.module('Tasker', ['ngRoute']);

app.service('requestProcessor', function($http) {
    //function that processes HTTP requests given a URL method and data
    this.processor = function(url, method, data) {
        console.log("processing....");
        var baseUrl = "http://interview.lenderprice.com:7070/api/";
        var req = {};
        var returnResponse;
        req.url = baseUrl + url;
        req.method = method;
        if (data) {
            req.data = data;
        }
        return $http(req);
    };
});

app.controller('taskController', function(requestProcessor, $scope, $http) {
    var httpServer = requestProcessor.processor;
    // grab tasks
    httpServer("jobs", "GET").then(function(response) {
        $scope.tasks = response.data;
    });
    // handler for submit task modal
    $scope.submitTask = function() {
        console.log("submitTask triggered");
        httpServer("jobs", "POST", {
            summary: $scope.formSummary,
            status: $scope.formStatus
        }).then(function(response) {
            console.log("Task Submitted: ");
            console.log(response);
            $scope.formSummary = "";
            $scope.formStatus = "";
        });
    };
    // handler for update task modal
    $scope.updateTask = function() {
        var updateUrl = 'jobs/' + $scope.formTaskId;
        var data = {
            summary: $scope.formSummary,
            description: $scope.formDescription,
            status: $scope.formStatus,
            start_date: $scope.formStartDate,
            end_date: $scope.formEndDate
        };
        httpServer(updateUrl, "POST", data).then(function(response) {
            console.log("Task Updated: ");
            console.log(response);
            $scope.formSummary = "";
            $scope.formDescription = "";
            $scope.formStatus = "";
            $scope.formStartDate = "";
            $scope.formEndDate = "";
        });
    };
});

app.controller('assigneeController', function(requestProcessor, $scope, $http) {
    var httpServer = requestProcessor.processor;
    // grab assignees
    httpServer("assignee", "GET").then(function(response) {
        $scope.assignees = response.data;
    });
    // grab tasks
    httpServer("jobs", "GET").then(function(response) {
        $scope.tasks = response.data;
    });
    $scope.submitAssignee = function() {
        httpServer("assignee", "POST", {
            name: $scope.formAssigneeName
        }).then(function(response) {
            console.log("Assignee Submitted");
            console.log(response);
        });
        $scope.formAssigneeName = " ";
    };
    $scope.assignTasks = function() {
        var assignUrl = "assignjob?" + "assignee_id=" + $scope.formAssignee._id + "&" + "job_id=" + $scope.formTaskId;
        httpServer(assignUrl, "POST").then(function(response) {
            console.log("Task Assigned");
            console.log(response);
        });
    };
});

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/tasks', {
            templateUrl: 'pages/tasks.html',
            controller: 'taskController'
        })
        .when('/assignees', {
            templateUrl: 'pages/assignees.html',
            controller: 'assigneeController'
        });
    $locationProvider.html5Mode(true);
});
