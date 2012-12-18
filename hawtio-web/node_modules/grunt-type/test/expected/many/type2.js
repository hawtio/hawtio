var foo = foo;
; ;
var Test2;
(function (Test2) {
    var Foo = (function () {
        function Foo() { }
        Foo.prototype.bar = function () {
            foo.bar();
            return "Hello from Test2.Foo.bar";
        };
        return Foo;
    })();
    Test2.Foo = Foo;    
})(Test2 || (Test2 = {}));

