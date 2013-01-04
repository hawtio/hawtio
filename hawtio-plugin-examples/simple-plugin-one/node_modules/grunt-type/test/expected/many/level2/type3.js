var FooBar = (function () {
    function FooBar() { }
    FooBar.prototype.sayHello = function () {
        console.log("hello!");
    };
    return FooBar;
})();
var foobar = new FooBar();
foobar.sayHello();
