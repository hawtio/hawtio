/// <reference path="../d.ts/jasmine.d.ts" />
/// <reference path="../../../main/d.ts/angular.d.ts" />
/// <reference path="../d.ts/angular-mocks.d.ts" />
describe("Angular Mocks", function () {

  var $rootScope;

  beforeEach(inject(function(_$rootScope_) {
    $rootScope = _$rootScope_;
  }));

  it('Should get access to the $rootScope', function() {
    expect($rootScope).not.toBeNull();
  });

  it('Has access to JQuery', function() {
    expect($).not.toBeNull();
    expect($("<div>hello!</div>").html()).toBe("hello!");
  });

});
