/// <reference path="../../baseIncludes.ts"/>
module ArrayHelpers {

    /**
     * Removes elements in the target array based on the new collection, returns true if
     * any changes were made
     */
    export function removeElements(collection:Array<any>, newCollection:Array<any>, index:string = 'id') {
      var oldLength = collection.length;
      collection.remove((item) => {
        return !newCollection.any((c:any) => { return c[index] === item[index] }); 
      });
      return collection.length !== oldLength;
    }

    /**
     * Changes the existing collection to match the new collection to avoid re-assigning
     * the array pointer, returns true if the array size has changed
     */
    export function sync(collection:Array<any>, newCollection:Array<any>, index:string = 'id') {
      var answer = removeElements(collection, newCollection, index);
      newCollection.forEach((item) => {
        var oldItem = collection.find((c) => { return c[index] === item[index]; });
        if (!oldItem) {
          answer = true;
          collection.push(item);
        } else {
          if (item !== oldItem) {
            angular.copy(item, oldItem);
          }
        }
      });
      return answer;
    }


}
