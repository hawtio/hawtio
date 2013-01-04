
module Test {
    export class Foo {
        public get bar() : string {
            return "foobar!";
        }
    }
}

var foo = new Test.Foo();
console.log(foo.bar);
