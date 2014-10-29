/*jshint globalstrict:true */
/*global angular:true */
'use strict';

angular.module('featured', [
    'featured.controllers', 
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