/// <reference path="./fabricInterfaces.ts"/>
module ProfileHelpers {

  export function getTags(profile:Fabric.Profile):Array<string> {
    var answer = <Array<string>>profile.tags;
    if (!answer || !answer.length) {
      answer = profile.id.split('-');
      answer = answer.first(answer.length - 1);
    }
    return answer;
  }

}
