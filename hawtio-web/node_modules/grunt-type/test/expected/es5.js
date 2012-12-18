var Test;
(function (Test) {
    var Foo = (function () {
        function Foo() { }
        Object.defineProperty(Foo.prototype, "bar", {
            get: function () {
                return "foobar!";
            },
            enumerable: true,
            configurable: true
        });
        return Foo;
    })();
    Test.Foo = Foo;    
})(Test || (Test = {}));

var foo = new Test.Foo();
console.log(foo.bar);
