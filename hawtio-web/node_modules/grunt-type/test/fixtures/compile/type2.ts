/// <reference path="def.d.ts" />

import foo = foo;

module Test2 {
    export class Foo {
        bar() {
            foo.bar();
            return "Hello from Test2.Foo.bar";
        }
    }
}
