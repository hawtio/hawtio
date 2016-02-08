/// <reference path="../lib/utils/testHelpers.ts"/>
/// <reference path="../../../main/webapp/app/helpers/js/filterHelpers.ts"/>
describe("FilterHelpers", () => {
  it("Should return true if this string contains this other string", () => {
    expect(FilterHelpers.searchObject("foobar", "bar")).toBe(true);
  });

  it("Should return false if this string doesn't contain this other string", () => {
    expect(FilterHelpers.searchObject("foobar", "biscuit")).toBe(false);
  });

  it("Should return true if this number contains this string", () => {
    expect(FilterHelpers.searchObject(12345, "34")).toBe(true);
  });

  var myAwesomeObject = {
    foo: 'bar',
    whatever: 'someValue',
    anArray: ['I have', 'a bunch', 'of values'],
    anArrayOfObjects: [{ one: 'fish', two: 'fish'}, { one: 'red fish', two: 'blue fish'}]
  };

  it("Should return true if this object contains this string", () => {
    expect(FilterHelpers.searchObject(myAwesomeObject, 'bar')).toBe(true);
  });

  it("Should return false even if this string matches a key in this object", () => {
    expect(FilterHelpers.searchObject(myAwesomeObject, 'foo')).toBe(false);
  });

  it("Should return true since this array in the object has this string", () => {
    expect(FilterHelpers.searchObject(myAwesomeObject, 'a bunch')).toBe(true);
  });

  it("Should return true since this object has an array of other objects, one of which has this string", () => {
    expect(FilterHelpers.searchObject(myAwesomeObject, 'red fish')).toBe(true);
  });

  it ("Should return false since the only thing that matches in this object is a key", () => {
    expect(FilterHelpers.searchObject(myAwesomeObject, 'two')).toBe(false);
  });


});
