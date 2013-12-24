/**
 * @module Quartz
 */
module Quartz {

  export var log:Logging.Logger = Logger.get("Quartz");

  export function iconClass(state:string) {
    if (state) {
      switch (state.toString().toLowerCase()) {
        case 'true':
          return "green icon-play-circle";
        case 'normal':
          return "green icon-play-circle";
        case 'paused':
          return "orange icon-off";
      }
    }
    return "orange icon-off";
  }

  export function misfireText(val:number) {
    if (val) {
      switch (val) {
        case -1:
          return "ignore";
        case 0:
          return "smart";
        case 1:
          return "fire once now";
        case 2:
          return "do nothing";
      }
    }
    return "unknown";
  }

  /**
   * Returns true if the state of the item begins with the given state - or one of the given states
   * @method
   * @param item the item which has a State
   * @param state a value or an array of states
   */
  export function isState(item, state) {
    var value = item.Started;
    if (angular.isArray(state)) {
      return state.any((stateText) => value.startsWith(stateText));
    } else {
      return value.startsWith(state);
    }
  }

  /**
   * Returns true if the Quartz plugin is enabled
   */
  export function isQuartzPluginEnabled(workspace:Workspace) {
    return getQuartzMBean(workspace);
  }

  export function getQuartzMBean(workspace: Workspace) {
    return Core.getMBeanTypeObjectName(workspace, "quartz", "QuartzScheduler");
  }

  export function isScheduler(workspace) {
    return workspace.hasDomainAndProperties('quartz', {type: 'QuartzScheduler'});
  }

  export function getSelectedSchedulerName(workspace:Workspace) {
    var selection = workspace.selection;
    if (selection && selection.domain === Quartz.jmxDomain) {
      // lets get the cache name
      return selection.entries["name"];
    }
    return null;
  }
}
