module Camel {

  /**
   * Returns true if the state of the item begins with the given state - or one of the given states
   *
   * @param item the item which has a State
   * @param state a value or an array of states
   */
  export function isState(item, state) {
    var value = (item.State || "").toLowerCase();
    if (angular.isArray(state)) {
      return state.any((stateText) => value.startsWith(stateText));
    } else {
      return value.startsWith(state);
    }
  }

  export function iconClass(state:string) {
    console.log("Calling iconClass with state " + state);
    if (state) {
      switch (state.toLowerCase()) {
        case 'started':
          //return "icon-thumbs-up";
          return "green icon-play";
/*
        case 'finalizing':
          return "icon-refresh icon-spin";
        case 'resolving':
          return "icon-sitemap";
*/
        case 'suspended':
          return "icon-pause";
      }
    }
    return "red icon-stop";
    //return "red icon-off";
  }
}