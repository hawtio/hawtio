/*jshint globalstrict:true */
/*global angular:true */
'use strict';

angular.module('elasticjs.filters', [])
    .filter('interpolate', ['version', function(version) {
        return function(text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    }]);