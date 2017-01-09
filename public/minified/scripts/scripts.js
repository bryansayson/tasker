/**
 * angular-growl-v2 - v0.7.8 - 2015-10-25
 * http://janstevens.github.io/angular-growl-2
 * Copyright (c) 2015 Marco Rinck,Jan Stevens,Silvan van Leeuwen; Licensed MIT
 */
angular.module('angular-growl', []);
angular.module('angular-growl').directive('growl', [function () {
    'use strict';
    return {
      restrict: 'A',
      templateUrl: 'templates/growl/growl.html',
      replace: false,
      scope: {
        reference: '@',
        inline: '=',
        limitMessages: '='
      },
      controller: [
        '$scope',
        '$interval',
        'growl',
        'growlMessages',
        function ($scope, $interval, growl, growlMessages) {
          $scope.referenceId = $scope.reference || 0;
          growlMessages.initDirective($scope.referenceId, $scope.limitMessages);
          $scope.growlMessages = growlMessages;
          $scope.inlineMessage = angular.isDefined($scope.inline) ? $scope.inline : growl.inlineMessages();
          $scope.$watch('limitMessages', function (limitMessages) {
            var directive = growlMessages.directives[$scope.referenceId];
            if (!angular.isUndefined(limitMessages) && !angular.isUndefined(directive)) {
              directive.limitMessages = limitMessages;
            }
          });
          $scope.stopTimeoutClose = function (message) {
            if (!message.clickToClose) {
              angular.forEach(message.promises, function (promise) {
                $interval.cancel(promise);
              });
              if (message.close) {
                growlMessages.deleteMessage(message);
              } else {
                message.close = true;
              }
            }
          };
          $scope.alertClasses = function (message) {
            return {
              'alert-success': message.severity === 'success',
              'alert-error': message.severity === 'error',
              'alert-danger': message.severity === 'error',
              'alert-info': message.severity === 'info',
              'alert-warning': message.severity === 'warning',
              'icon': message.disableIcons === false,
              'alert-dismissable': !message.disableCloseButton
            };
          };
          $scope.showCountDown = function (message) {
            return !message.disableCountDown && message.ttl > 0;
          };
          $scope.wrapperClasses = function () {
            var classes = {};
            classes['growl-fixed'] = !$scope.inlineMessage;
            classes[growl.position()] = true;
            return classes;
          };
          $scope.computeTitle = function (message) {
            var ret = {
                'success': 'Success',
                'error': 'Error',
                'info': 'Information',
                'warn': 'Warning'
              };
            return ret[message.severity];
          };
        }
      ]
    };
  }]);
angular.module('angular-growl').run([
  '$templateCache',
  function ($templateCache) {
    'use strict';
    if ($templateCache.get('templates/growl/growl.html') === undefined) {
      $templateCache.put('templates/growl/growl.html', '<div class="growl-container" ng-class="wrapperClasses()">' + '<div class="growl-item alert" ng-repeat="message in growlMessages.directives[referenceId].messages" ng-class="alertClasses(message)" ng-click="stopTimeoutClose(message)">' + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true" ng-click="growlMessages.deleteMessage(message)" ng-show="!message.disableCloseButton">&times;</button>' + '<button type="button" class="close" aria-hidden="true" ng-show="showCountDown(message)">{{message.countdown}}</button>' + '<h4 class="growl-title" ng-show="message.title" ng-bind="message.title"></h4>' + '<div class="growl-message" ng-bind-html="message.text"></div>' + '</div>' + '</div>');
    }
  }
]);
angular.module('angular-growl').provider('growl', function () {
  'use strict';
  var _ttl = {
      success: null,
      error: null,
      warning: null,
      info: null
    }, _messagesKey = 'messages', _messageTextKey = 'text', _messageTitleKey = 'title', _messageSeverityKey = 'severity', _messageTTLKey = 'ttl', _onlyUniqueMessages = true, _messageVariableKey = 'variables', _referenceId = 0, _inline = false, _position = 'top-right', _disableCloseButton = false, _disableIcons = false, _reverseOrder = false, _disableCountDown = false, _translateMessages = true;
  this.globalTimeToLive = function (ttl) {
    if (typeof ttl === 'object') {
      for (var k in ttl) {
        if (ttl.hasOwnProperty(k)) {
          _ttl[k] = ttl[k];
        }
      }
    } else {
      for (var severity in _ttl) {
        if (_ttl.hasOwnProperty(severity)) {
          _ttl[severity] = ttl;
        }
      }
    }
    return this;
  };
  this.globalTranslateMessages = function (translateMessages) {
    _translateMessages = translateMessages;
    return this;
  };
  this.globalDisableCloseButton = function (disableCloseButton) {
    _disableCloseButton = disableCloseButton;
    return this;
  };
  this.globalDisableIcons = function (disableIcons) {
    _disableIcons = disableIcons;
    return this;
  };
  this.globalReversedOrder = function (reverseOrder) {
    _reverseOrder = reverseOrder;
    return this;
  };
  this.globalDisableCountDown = function (countDown) {
    _disableCountDown = countDown;
    return this;
  };
  this.messageVariableKey = function (messageVariableKey) {
    _messageVariableKey = messageVariableKey;
    return this;
  };
  this.globalInlineMessages = function (inline) {
    _inline = inline;
    return this;
  };
  this.globalPosition = function (position) {
    _position = position;
    return this;
  };
  this.messagesKey = function (messagesKey) {
    _messagesKey = messagesKey;
    return this;
  };
  this.messageTextKey = function (messageTextKey) {
    _messageTextKey = messageTextKey;
    return this;
  };
  this.messageTitleKey = function (messageTitleKey) {
    _messageTitleKey = messageTitleKey;
    return this;
  };
  this.messageSeverityKey = function (messageSeverityKey) {
    _messageSeverityKey = messageSeverityKey;
    return this;
  };
  this.messageTTLKey = function (messageTTLKey) {
    _messageTTLKey = messageTTLKey;
    return this;
  };
  this.onlyUniqueMessages = function (onlyUniqueMessages) {
    _onlyUniqueMessages = onlyUniqueMessages;
    return this;
  };
  this.serverMessagesInterceptor = [
    '$q',
    'growl',
    function ($q, growl) {
      function checkResponse(response) {
        if (response !== undefined && response.data && response.data[_messagesKey] && response.data[_messagesKey].length > 0) {
          growl.addServerMessages(response.data[_messagesKey]);
        }
      }
      return {
        'response': function (response) {
          checkResponse(response);
          return response;
        },
        'responseError': function (rejection) {
          checkResponse(rejection);
          return $q.reject(rejection);
        }
      };
    }
  ];
  this.$get = [
    '$rootScope',
    '$interpolate',
    '$sce',
    '$filter',
    '$interval',
    'growlMessages',
    function ($rootScope, $interpolate, $sce, $filter, $interval, growlMessages) {
      var translate;
      growlMessages.onlyUnique = _onlyUniqueMessages;
      growlMessages.reverseOrder = _reverseOrder;
      try {
        translate = $filter('translate');
      } catch (e) {
      }
      function broadcastMessage(message) {
        if (translate && message.translateMessage) {
          message.text = translate(message.text, message.variables) || message.text;
          message.title = translate(message.title) || message.title;
        } else {
          var polation = $interpolate(message.text);
          message.text = polation(message.variables);
        }
        var addedMessage = growlMessages.addMessage(message);
        $rootScope.$broadcast('growlMessage', message);
        $interval(function () {
        }, 0, 1);
        return addedMessage;
      }
      function sendMessage(text, config, severity) {
        var _config = config || {}, message;
        message = {
          text: text,
          title: _config.title,
          severity: severity,
          ttl: _config.ttl || _ttl[severity],
          variables: _config.variables || {},
          disableCloseButton: _config.disableCloseButton === undefined ? _disableCloseButton : _config.disableCloseButton,
          disableIcons: _config.disableIcons === undefined ? _disableIcons : _config.disableIcons,
          disableCountDown: _config.disableCountDown === undefined ? _disableCountDown : _config.disableCountDown,
          position: _config.position || _position,
          referenceId: _config.referenceId || _referenceId,
          translateMessage: _config.translateMessage === undefined ? _translateMessages : _config.translateMessage,
          destroy: function () {
            growlMessages.deleteMessage(message);
          },
          setText: function (newText) {
            message.text = $sce.trustAsHtml(String(newText));
          },
          onclose: _config.onclose,
          onopen: _config.onopen
        };
        return broadcastMessage(message);
      }
      function warning(text, config) {
        return sendMessage(text, config, 'warning');
      }
      function error(text, config) {
        return sendMessage(text, config, 'error');
      }
      function info(text, config) {
        return sendMessage(text, config, 'info');
      }
      function success(text, config) {
        return sendMessage(text, config, 'success');
      }
      function general(text, config, severity) {
        severity = (severity || 'error').toLowerCase();
        return sendMessage(text, config, severity);
      }
      function addServerMessages(messages) {
        if (!messages || !messages.length) {
          return;
        }
        var i, message, severity, length;
        length = messages.length;
        for (i = 0; i < length; i++) {
          message = messages[i];
          if (message[_messageTextKey]) {
            severity = (message[_messageSeverityKey] || 'error').toLowerCase();
            var config = {};
            config.variables = message[_messageVariableKey] || {};
            config.title = message[_messageTitleKey];
            if (message[_messageTTLKey]) {
              config.ttl = message[_messageTTLKey];
            }
            sendMessage(message[_messageTextKey], config, severity);
          }
        }
      }
      function onlyUnique() {
        return _onlyUniqueMessages;
      }
      function reverseOrder() {
        return _reverseOrder;
      }
      function inlineMessages() {
        return _inline;
      }
      function position() {
        return _position;
      }
      return {
        warning: warning,
        error: error,
        info: info,
        success: success,
        general: general,
        addServerMessages: addServerMessages,
        onlyUnique: onlyUnique,
        reverseOrder: reverseOrder,
        inlineMessages: inlineMessages,
        position: position
      };
    }
  ];
});
angular.module('angular-growl').service('growlMessages', [
  '$sce',
  '$interval',
  function ($sce, $interval) {
    'use strict';
    var self = this;
    this.directives = {};
    var preloadDirectives = {};
    function preLoad(referenceId) {
      var directive;
      if (preloadDirectives[referenceId]) {
        directive = preloadDirectives[referenceId];
      } else {
        directive = preloadDirectives[referenceId] = { messages: [] };
      }
      return directive;
    }
    function directiveForRefId(referenceId) {
      var refId = referenceId || 0;
      return self.directives[refId] || preloadDirectives[refId];
    }
    this.initDirective = function (referenceId, limitMessages) {
      if (preloadDirectives[referenceId]) {
        this.directives[referenceId] = preloadDirectives[referenceId];
        this.directives[referenceId].limitMessages = limitMessages;
      } else {
        this.directives[referenceId] = {
          messages: [],
          limitMessages: limitMessages
        };
      }
      return this.directives[referenceId];
    };
    this.getAllMessages = function (referenceId) {
      referenceId = referenceId || 0;
      var messages;
      if (directiveForRefId(referenceId)) {
        messages = directiveForRefId(referenceId).messages;
      } else {
        messages = [];
      }
      return messages;
    };
    this.destroyAllMessages = function (referenceId) {
      var messages = this.getAllMessages(referenceId);
      for (var i = messages.length - 1; i >= 0; i--) {
        messages[i].destroy();
      }
      var directive = directiveForRefId(referenceId);
      if (directive) {
        directive.messages = [];
      }
    };
    this.addMessage = function (message) {
      var directive, messages, found, msgText;
      if (this.directives[message.referenceId]) {
        directive = this.directives[message.referenceId];
      } else {
        directive = preLoad(message.referenceId);
      }
      messages = directive.messages;
      if (this.onlyUnique) {
        angular.forEach(messages, function (msg) {
          msgText = $sce.getTrustedHtml(msg.text);
          if (message.text === msgText && message.severity === msg.severity && message.title === msg.title) {
            found = true;
          }
        });
        if (found) {
          return;
        }
      }
      message.text = $sce.trustAsHtml(String(message.text));
      if (message.ttl && message.ttl !== -1) {
        message.countdown = message.ttl / 1000;
        message.promises = [];
        message.close = false;
        message.countdownFunction = function () {
          if (message.countdown > 1) {
            message.countdown--;
            message.promises.push($interval(message.countdownFunction, 1000, 1, 1));
          } else {
            message.countdown--;
          }
        };
      }
      if (angular.isDefined(directive.limitMessages)) {
        var diff = messages.length - (directive.limitMessages - 1);
        if (diff > 0) {
          messages.splice(directive.limitMessages - 1, diff);
        }
      }
      if (this.reverseOrder) {
        messages.unshift(message);
      } else {
        messages.push(message);
      }
      if (typeof message.onopen === 'function') {
        message.onopen();
      }
      if (message.ttl && message.ttl !== -1) {
        var self = this;
        message.promises.push($interval(angular.bind(this, function () {
          self.deleteMessage(message);
        }), message.ttl, 1, 1));
        message.promises.push($interval(message.countdownFunction, 1000, 1, 1));
      }
      return message;
    };
    this.deleteMessage = function (message) {
      var messages = this.getAllMessages(message.referenceId), index = -1;
      for (var i in messages) {
        if (messages.hasOwnProperty(i)) {
          index = messages[i] === message ? i : index;
        }
      }
      if (index > -1) {
        messages[index].close = true;
        messages.splice(index, 1);
      }
      if (typeof message.onclose === 'function') {
        message.onclose();
      }
    };
  }
]);

var app = angular.module('Tasker', ['ngRoute', 'angular-growl']);

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

app.controller('taskController', function(requestProcessor, $scope, $http, growl) {
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
            if (response.status === 200) {
              growl.success("Success! " + "Task: " + response.config.data.summary + "was created with success message " + response.data.message + ".", {ttl: 10000});
            }
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
            if (response.status === 200) {
              growl.success("Success! " + response.data.message, {ttl: 10000});
            }
            $scope.formSummary = "";
            $scope.formDescription = "";
            $scope.formStatus = "";
            $scope.formStartDate = "";
            $scope.formEndDate = "";
        });
    };
});

app.controller('assigneeController', function(requestProcessor, $scope, $http, growl) {
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
            if (response.status === 200) {
              growl.success("Success! " + "Assignee " + response.config.data.name + " has been created.", {ttl: 10000});
            }
        });
        $scope.formAssigneeName = " ";
    };
    $scope.assignTasks = function() {
        var assignUrl = "assignjob?" + "assignee_id=" + $scope.formAssignee._id + "&" + "job_id=" + $scope.formTaskId;
        httpServer(assignUrl, "POST").then(function(response) {
            console.log("Task Assigned");
            console.log(response);
            if (response.status === 200) {
              growl.success("Success! " +  $scope.formTaskId + " was successfully assigned to " + $scope.formAssignee.name +".", {ttl: 10000});
            }
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

/*

    countUp.js
    by @inorganik

*/

// target = id of html element or var of previously selected html element where counting occurs
// startVal = the value you want to begin at
// endVal = the value you want to arrive at
// decimals = number of decimal places, default 0
// duration = duration of animation in seconds, default 2
// options = optional object of options (see below)

var CountUp = function(target, startVal, endVal, decimals, duration, options) {

    // make sure requestAnimationFrame and cancelAnimationFrame are defined
    // polyfill for browsers without native support
    // by Opera engineer Erik Möller
    var lastTime = 0;
    var vendors = ['webkit', 'moz', 'ms', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }

    var self = this;

    // default options
    self.options = {
        useEasing: true, // toggle easing
        useGrouping: true, // 1,000,000 vs 1000000
        separator: ',', // character to use as a separator
        decimal: '.', // character to use as a decimal
        easingFn: null, // optional custom easing closure function, default is Robert Penner's easeOutExpo
        formattingFn: null // optional custom formatting function, default is self.formatNumber below
    };
    // extend default options with passed options object
    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            self.options[key] = options[key];
        }
    }
    if (self.options.separator === '') {
        self.options.useGrouping = false;
    }
    if (!self.options.prefix) self.options.prefix = '';
    if (!self.options.suffix) self.options.suffix = '';

    self.d = (typeof target === 'string') ? document.getElementById(target) : target;
    self.startVal = Number(startVal);
    self.endVal = Number(endVal);
    self.countDown = (self.startVal > self.endVal);
    self.frameVal = self.startVal;
    self.decimals = Math.max(0, decimals || 0);
    self.dec = Math.pow(10, self.decimals);
    self.duration = Number(duration) * 1000 || 2000;

    self.formatNumber = function(nStr) {
        nStr = nStr.toFixed(self.decimals);
        nStr += '';
        var x, x1, x2, rgx;
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? self.options.decimal + x[1] : '';
        rgx = /(\d+)(\d{3})/;
        if (self.options.useGrouping) {
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + self.options.separator + '$2');
            }
        }
        return self.options.prefix + x1 + x2 + self.options.suffix;
    };
    // Robert Penner's easeOutExpo
    self.easeOutExpo = function(t, b, c, d) {
        return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
    };

    self.easingFn = self.options.easingFn ? self.options.easingFn : self.easeOutExpo;
    self.formattingFn = self.options.formattingFn ? self.options.formattingFn : self.formatNumber;

    self.version = function() {
        return '1.7.1';
    };

    // Print value to target
    self.printValue = function(value) {
        var result = self.formattingFn(value);

        if (self.d.tagName === 'INPUT') {
            this.d.value = result;
        } else if (self.d.tagName === 'text' || self.d.tagName === 'tspan') {
            this.d.textContent = result;
        } else {
            this.d.innerHTML = result;
        }
    };

    self.count = function(timestamp) {

        if (!self.startTime) {
            self.startTime = timestamp;
        }

        self.timestamp = timestamp;
        var progress = timestamp - self.startTime;
        self.remaining = self.duration - progress;

        // to ease or not to ease
        if (self.options.useEasing) {
            if (self.countDown) {
                self.frameVal = self.startVal - self.easingFn(progress, 0, self.startVal - self.endVal, self.duration);
            } else {
                self.frameVal = self.easingFn(progress, self.startVal, self.endVal - self.startVal, self.duration);
            }
        } else {
            if (self.countDown) {
                self.frameVal = self.startVal - ((self.startVal - self.endVal) * (progress / self.duration));
            } else {
                self.frameVal = self.startVal + (self.endVal - self.startVal) * (progress / self.duration);
            }
        }

        // don't go past endVal since progress can exceed duration in the last frame
        if (self.countDown) {
            self.frameVal = (self.frameVal < self.endVal) ? self.endVal : self.frameVal;
        } else {
            self.frameVal = (self.frameVal > self.endVal) ? self.endVal : self.frameVal;
        }

        // decimal
        self.frameVal = Math.round(self.frameVal * self.dec) / self.dec;

        // format and print value
        self.printValue(self.frameVal);

        // whether to continue
        if (progress < self.duration) {
            self.rAF = requestAnimationFrame(self.count);
        } else {
            if (self.callback) {
                self.callback();
            }
        }
    };
    // start your animation
    self.start = function(callback) {
        self.callback = callback;
        self.rAF = requestAnimationFrame(self.count);
        return false;
    };
    // toggles pause/resume animation
    self.pauseResume = function() {
        if (!self.paused) {
            self.paused = true;
            cancelAnimationFrame(self.rAF);
        } else {
            self.paused = false;
            delete self.startTime;
            self.duration = self.remaining;
            self.startVal = self.frameVal;
            requestAnimationFrame(self.count);
        }
    };
    // reset to startVal so animation can be run again
    self.reset = function() {
        self.paused = false;
        delete self.startTime;
        self.startVal = startVal;
        cancelAnimationFrame(self.rAF);
        self.printValue(self.startVal);
    };
    // pass a new endVal and start animation
    self.update = function(newEndVal) {
        cancelAnimationFrame(self.rAF);
        self.paused = false;
        delete self.startTime;
        self.startVal = self.frameVal;
        self.endVal = Number(newEndVal);
        self.countDown = (self.startVal > self.endVal);
        self.rAF = requestAnimationFrame(self.count);
    };

    // format startVal on initialization
    self.printValue(self.startVal);
};

var options = {
  useEasing : true, 
  useGrouping : true, 
  separator : ',', 
  decimal : '.', 
  prefix : '', 
  suffix : '' 
};

$.get("http://interview.lenderprice.com:7070/api/jobs")
  .done(function( data ) {
    var taskCount = data.length;
    var taskCounter = new CountUp("taskCounter", 0, taskCount, 0, 10, options);
    taskCounter.start();
});

$.get("http://interview.lenderprice.com:7070/api/assignee")
  .done(function( data ) {
    var words = [];
    var current = 0;
    var tar = $('.tasker-name-container');
    var assigneeCount = data.length;
    var assigneeCounter = new CountUp("assigneeCounter", 0, assigneeCount, 0, 10, options);
    assigneeCounter.start();
    $.each(data, function(index, assigneeObj) {
      words.push(assigneeObj.name);
    });
    $('.tasker-name-container').fadeIn(1000);
    $('.tasker-name-container').fadeOut(2000);
    setInterval(function () {
      current = (current==words.length) ? 0 : current;
      tar.html(words[current]);
      current += 1;
      $('.tasker-name-container').fadeIn(1000);
       $('.tasker-name-container').fadeOut(2000);
    }, 3000);
});

/**
 * angular-growl-v2 - v0.7.8 - 2015-10-25
 * http://janstevens.github.io/angular-growl-2
 * Copyright (c) 2015 Marco Rinck,Jan Stevens,Silvan van Leeuwen; Licensed MIT
 */
angular.module('angular-growl', []);
angular.module('angular-growl').directive('growl', [function () {
    'use strict';
    return {
      restrict: 'A',
      templateUrl: 'templates/growl/growl.html',
      replace: false,
      scope: {
        reference: '@',
        inline: '=',
        limitMessages: '='
      },
      controller: [
        '$scope',
        '$interval',
        'growl',
        'growlMessages',
        function ($scope, $interval, growl, growlMessages) {
          $scope.referenceId = $scope.reference || 0;
          growlMessages.initDirective($scope.referenceId, $scope.limitMessages);
          $scope.growlMessages = growlMessages;
          $scope.inlineMessage = angular.isDefined($scope.inline) ? $scope.inline : growl.inlineMessages();
          $scope.$watch('limitMessages', function (limitMessages) {
            var directive = growlMessages.directives[$scope.referenceId];
            if (!angular.isUndefined(limitMessages) && !angular.isUndefined(directive)) {
              directive.limitMessages = limitMessages;
            }
          });
          $scope.stopTimeoutClose = function (message) {
            if (!message.clickToClose) {
              angular.forEach(message.promises, function (promise) {
                $interval.cancel(promise);
              });
              if (message.close) {
                growlMessages.deleteMessage(message);
              } else {
                message.close = true;
              }
            }
          };
          $scope.alertClasses = function (message) {
            return {
              'alert-success': message.severity === 'success',
              'alert-error': message.severity === 'error',
              'alert-danger': message.severity === 'error',
              'alert-info': message.severity === 'info',
              'alert-warning': message.severity === 'warning',
              'icon': message.disableIcons === false,
              'alert-dismissable': !message.disableCloseButton
            };
          };
          $scope.showCountDown = function (message) {
            return !message.disableCountDown && message.ttl > 0;
          };
          $scope.wrapperClasses = function () {
            var classes = {};
            classes['growl-fixed'] = !$scope.inlineMessage;
            classes[growl.position()] = true;
            return classes;
          };
          $scope.computeTitle = function (message) {
            var ret = {
                'success': 'Success',
                'error': 'Error',
                'info': 'Information',
                'warn': 'Warning'
              };
            return ret[message.severity];
          };
        }
      ]
    };
  }]);
angular.module('angular-growl').run([
  '$templateCache',
  function ($templateCache) {
    'use strict';
    if ($templateCache.get('templates/growl/growl.html') === undefined) {
      $templateCache.put('templates/growl/growl.html', '<div class="growl-container" ng-class="wrapperClasses()">' + '<div class="growl-item alert" ng-repeat="message in growlMessages.directives[referenceId].messages" ng-class="alertClasses(message)" ng-click="stopTimeoutClose(message)">' + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true" ng-click="growlMessages.deleteMessage(message)" ng-show="!message.disableCloseButton">&times;</button>' + '<button type="button" class="close" aria-hidden="true" ng-show="showCountDown(message)">{{message.countdown}}</button>' + '<h4 class="growl-title" ng-show="message.title" ng-bind="message.title"></h4>' + '<div class="growl-message" ng-bind-html="message.text"></div>' + '</div>' + '</div>');
    }
  }
]);
angular.module('angular-growl').provider('growl', function () {
  'use strict';
  var _ttl = {
      success: null,
      error: null,
      warning: null,
      info: null
    }, _messagesKey = 'messages', _messageTextKey = 'text', _messageTitleKey = 'title', _messageSeverityKey = 'severity', _messageTTLKey = 'ttl', _onlyUniqueMessages = true, _messageVariableKey = 'variables', _referenceId = 0, _inline = false, _position = 'top-right', _disableCloseButton = false, _disableIcons = false, _reverseOrder = false, _disableCountDown = false, _translateMessages = true;
  this.globalTimeToLive = function (ttl) {
    if (typeof ttl === 'object') {
      for (var k in ttl) {
        if (ttl.hasOwnProperty(k)) {
          _ttl[k] = ttl[k];
        }
      }
    } else {
      for (var severity in _ttl) {
        if (_ttl.hasOwnProperty(severity)) {
          _ttl[severity] = ttl;
        }
      }
    }
    return this;
  };
  this.globalTranslateMessages = function (translateMessages) {
    _translateMessages = translateMessages;
    return this;
  };
  this.globalDisableCloseButton = function (disableCloseButton) {
    _disableCloseButton = disableCloseButton;
    return this;
  };
  this.globalDisableIcons = function (disableIcons) {
    _disableIcons = disableIcons;
    return this;
  };
  this.globalReversedOrder = function (reverseOrder) {
    _reverseOrder = reverseOrder;
    return this;
  };
  this.globalDisableCountDown = function (countDown) {
    _disableCountDown = countDown;
    return this;
  };
  this.messageVariableKey = function (messageVariableKey) {
    _messageVariableKey = messageVariableKey;
    return this;
  };
  this.globalInlineMessages = function (inline) {
    _inline = inline;
    return this;
  };
  this.globalPosition = function (position) {
    _position = position;
    return this;
  };
  this.messagesKey = function (messagesKey) {
    _messagesKey = messagesKey;
    return this;
  };
  this.messageTextKey = function (messageTextKey) {
    _messageTextKey = messageTextKey;
    return this;
  };
  this.messageTitleKey = function (messageTitleKey) {
    _messageTitleKey = messageTitleKey;
    return this;
  };
  this.messageSeverityKey = function (messageSeverityKey) {
    _messageSeverityKey = messageSeverityKey;
    return this;
  };
  this.messageTTLKey = function (messageTTLKey) {
    _messageTTLKey = messageTTLKey;
    return this;
  };
  this.onlyUniqueMessages = function (onlyUniqueMessages) {
    _onlyUniqueMessages = onlyUniqueMessages;
    return this;
  };
  this.serverMessagesInterceptor = [
    '$q',
    'growl',
    function ($q, growl) {
      function checkResponse(response) {
        if (response !== undefined && response.data && response.data[_messagesKey] && response.data[_messagesKey].length > 0) {
          growl.addServerMessages(response.data[_messagesKey]);
        }
      }
      return {
        'response': function (response) {
          checkResponse(response);
          return response;
        },
        'responseError': function (rejection) {
          checkResponse(rejection);
          return $q.reject(rejection);
        }
      };
    }
  ];
  this.$get = [
    '$rootScope',
    '$interpolate',
    '$sce',
    '$filter',
    '$interval',
    'growlMessages',
    function ($rootScope, $interpolate, $sce, $filter, $interval, growlMessages) {
      var translate;
      growlMessages.onlyUnique = _onlyUniqueMessages;
      growlMessages.reverseOrder = _reverseOrder;
      try {
        translate = $filter('translate');
      } catch (e) {
      }
      function broadcastMessage(message) {
        if (translate && message.translateMessage) {
          message.text = translate(message.text, message.variables) || message.text;
          message.title = translate(message.title) || message.title;
        } else {
          var polation = $interpolate(message.text);
          message.text = polation(message.variables);
        }
        var addedMessage = growlMessages.addMessage(message);
        $rootScope.$broadcast('growlMessage', message);
        $interval(function () {
        }, 0, 1);
        return addedMessage;
      }
      function sendMessage(text, config, severity) {
        var _config = config || {}, message;
        message = {
          text: text,
          title: _config.title,
          severity: severity,
          ttl: _config.ttl || _ttl[severity],
          variables: _config.variables || {},
          disableCloseButton: _config.disableCloseButton === undefined ? _disableCloseButton : _config.disableCloseButton,
          disableIcons: _config.disableIcons === undefined ? _disableIcons : _config.disableIcons,
          disableCountDown: _config.disableCountDown === undefined ? _disableCountDown : _config.disableCountDown,
          position: _config.position || _position,
          referenceId: _config.referenceId || _referenceId,
          translateMessage: _config.translateMessage === undefined ? _translateMessages : _config.translateMessage,
          destroy: function () {
            growlMessages.deleteMessage(message);
          },
          setText: function (newText) {
            message.text = $sce.trustAsHtml(String(newText));
          },
          onclose: _config.onclose,
          onopen: _config.onopen
        };
        return broadcastMessage(message);
      }
      function warning(text, config) {
        return sendMessage(text, config, 'warning');
      }
      function error(text, config) {
        return sendMessage(text, config, 'error');
      }
      function info(text, config) {
        return sendMessage(text, config, 'info');
      }
      function success(text, config) {
        return sendMessage(text, config, 'success');
      }
      function general(text, config, severity) {
        severity = (severity || 'error').toLowerCase();
        return sendMessage(text, config, severity);
      }
      function addServerMessages(messages) {
        if (!messages || !messages.length) {
          return;
        }
        var i, message, severity, length;
        length = messages.length;
        for (i = 0; i < length; i++) {
          message = messages[i];
          if (message[_messageTextKey]) {
            severity = (message[_messageSeverityKey] || 'error').toLowerCase();
            var config = {};
            config.variables = message[_messageVariableKey] || {};
            config.title = message[_messageTitleKey];
            if (message[_messageTTLKey]) {
              config.ttl = message[_messageTTLKey];
            }
            sendMessage(message[_messageTextKey], config, severity);
          }
        }
      }
      function onlyUnique() {
        return _onlyUniqueMessages;
      }
      function reverseOrder() {
        return _reverseOrder;
      }
      function inlineMessages() {
        return _inline;
      }
      function position() {
        return _position;
      }
      return {
        warning: warning,
        error: error,
        info: info,
        success: success,
        general: general,
        addServerMessages: addServerMessages,
        onlyUnique: onlyUnique,
        reverseOrder: reverseOrder,
        inlineMessages: inlineMessages,
        position: position
      };
    }
  ];
});
angular.module('angular-growl').service('growlMessages', [
  '$sce',
  '$interval',
  function ($sce, $interval) {
    'use strict';
    var self = this;
    this.directives = {};
    var preloadDirectives = {};
    function preLoad(referenceId) {
      var directive;
      if (preloadDirectives[referenceId]) {
        directive = preloadDirectives[referenceId];
      } else {
        directive = preloadDirectives[referenceId] = { messages: [] };
      }
      return directive;
    }
    function directiveForRefId(referenceId) {
      var refId = referenceId || 0;
      return self.directives[refId] || preloadDirectives[refId];
    }
    this.initDirective = function (referenceId, limitMessages) {
      if (preloadDirectives[referenceId]) {
        this.directives[referenceId] = preloadDirectives[referenceId];
        this.directives[referenceId].limitMessages = limitMessages;
      } else {
        this.directives[referenceId] = {
          messages: [],
          limitMessages: limitMessages
        };
      }
      return this.directives[referenceId];
    };
    this.getAllMessages = function (referenceId) {
      referenceId = referenceId || 0;
      var messages;
      if (directiveForRefId(referenceId)) {
        messages = directiveForRefId(referenceId).messages;
      } else {
        messages = [];
      }
      return messages;
    };
    this.destroyAllMessages = function (referenceId) {
      var messages = this.getAllMessages(referenceId);
      for (var i = messages.length - 1; i >= 0; i--) {
        messages[i].destroy();
      }
      var directive = directiveForRefId(referenceId);
      if (directive) {
        directive.messages = [];
      }
    };
    this.addMessage = function (message) {
      var directive, messages, found, msgText;
      if (this.directives[message.referenceId]) {
        directive = this.directives[message.referenceId];
      } else {
        directive = preLoad(message.referenceId);
      }
      messages = directive.messages;
      if (this.onlyUnique) {
        angular.forEach(messages, function (msg) {
          msgText = $sce.getTrustedHtml(msg.text);
          if (message.text === msgText && message.severity === msg.severity && message.title === msg.title) {
            found = true;
          }
        });
        if (found) {
          return;
        }
      }
      message.text = $sce.trustAsHtml(String(message.text));
      if (message.ttl && message.ttl !== -1) {
        message.countdown = message.ttl / 1000;
        message.promises = [];
        message.close = false;
        message.countdownFunction = function () {
          if (message.countdown > 1) {
            message.countdown--;
            message.promises.push($interval(message.countdownFunction, 1000, 1, 1));
          } else {
            message.countdown--;
          }
        };
      }
      if (angular.isDefined(directive.limitMessages)) {
        var diff = messages.length - (directive.limitMessages - 1);
        if (diff > 0) {
          messages.splice(directive.limitMessages - 1, diff);
        }
      }
      if (this.reverseOrder) {
        messages.unshift(message);
      } else {
        messages.push(message);
      }
      if (typeof message.onopen === 'function') {
        message.onopen();
      }
      if (message.ttl && message.ttl !== -1) {
        var self = this;
        message.promises.push($interval(angular.bind(this, function () {
          self.deleteMessage(message);
        }), message.ttl, 1, 1));
        message.promises.push($interval(message.countdownFunction, 1000, 1, 1));
      }
      return message;
    };
    this.deleteMessage = function (message) {
      var messages = this.getAllMessages(message.referenceId), index = -1;
      for (var i in messages) {
        if (messages.hasOwnProperty(i)) {
          index = messages[i] === message ? i : index;
        }
      }
      if (index > -1) {
        messages[index].close = true;
        messages.splice(index, 1);
      }
      if (typeof message.onclose === 'function') {
        message.onclose();
      }
    };
  }
]);

var app = angular.module('Tasker', ['ngRoute', 'angular-growl']);

app.service('requestProcessor', ["$http", function($http) {
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
}]);

app.controller('taskController', ["requestProcessor", "$scope", "$http", "growl", function(requestProcessor, $scope, $http, growl) {
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
            if (response.status === 200) {
              growl.success("Success! " + "Task: " + response.config.data.summary + "was created with success message " + response.data.message + ".", {ttl: 10000});
            }
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
            if (response.status === 200) {
              growl.success("Success! " + response.data.message, {ttl: 10000});
            }
            $scope.formSummary = "";
            $scope.formDescription = "";
            $scope.formStatus = "";
            $scope.formStartDate = "";
            $scope.formEndDate = "";
        });
    };
}]);

app.controller('assigneeController', ["requestProcessor", "$scope", "$http", "growl", function(requestProcessor, $scope, $http, growl) {
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
            if (response.status === 200) {
              growl.success("Success! " + "Assignee " + response.config.data.name + " has been created.", {ttl: 10000});
            }
        });
        $scope.formAssigneeName = " ";
    };
    $scope.assignTasks = function() {
        var assignUrl = "assignjob?" + "assignee_id=" + $scope.formAssignee._id + "&" + "job_id=" + $scope.formTaskId;
        httpServer(assignUrl, "POST").then(function(response) {
            console.log("Task Assigned");
            console.log(response);
            if (response.status === 200) {
              growl.success("Success! " +  $scope.formTaskId + " was successfully assigned to " + $scope.formAssignee.name +".", {ttl: 10000});
            }
        });
    };
}]);

app.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
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
}]);
