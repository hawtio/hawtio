/*jshint globalstrict:true */
/*global angular:true */
'use strict';

/* Application level module which depends on filters, controllers, and services */
angular.module('elasticjs', [
    'elasticjs.controllers', 
    'elasticjs.filters', 
    'elasticjs.services', 
    'elasticjs.directives', 
    'elasticjs.service'
    ]).config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/search', {
                templateUrl: 'partials/search.html'
            })
            .when('/results', {
                templateUrl: 'partials/results.html' 
            })
            .otherwise({
                redirectTo: '/search'
            });
  }]);