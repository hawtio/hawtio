var Type1;
(function (Type1) {
    function main() {
        console.log("hello world!");
    }
    Type1.main = main;
})(Type1 || (Type1 = {}));

Type1.main();
