/// <reference path="../../d.ts/jasmine.d.ts" />

module Test {

  /**
   * Concatenates two Strings
   *
   * @param s1
   * @param s2
   * @returns {string}
   */
  export function cat(s1:string, s2:string):string {
    return (s1 == null ? "" : s1) + (s2 == null ? "" : s2);
  }

  export class C1 {
    p1:string;

    constructor(message:string) {
      this.p1 = message;
    }

    hello():string {
      return "Hello " + this.p1 + "!";
    }
  }

}
