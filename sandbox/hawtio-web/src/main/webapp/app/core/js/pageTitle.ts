module Core {

  export class PageTitle {

    private titleElements: { (): string } [] = [];

    public addTitleElement(element:() => string):void {
      this.titleElements.push(element);
    }

    public getTitle():string {
      return this.getTitleExcluding([], ' ');
    }

    public getTitleWithSeparator(separator:string):string {
      return this.getTitleExcluding([], separator);
    }

    public getTitleExcluding(excludes:string[], separator:string):string {
      return this.getTitleArrayExcluding(excludes).join(separator);
    }

    public getTitleArrayExcluding(excludes:string[]):string[] {
      return <string[]>this.titleElements.map((element):string => {
        var answer:string = '';
        if (element) {
          answer = element();
          if (answer === null) {
            return '';
          }
        }
        return answer;
      }).exclude(<any> excludes).exclude('');
    }
  }

}
