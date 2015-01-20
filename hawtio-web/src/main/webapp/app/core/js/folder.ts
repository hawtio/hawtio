/// <reference path="coreHelpers.ts"/>
/**
 * @module Core
 */
module Core {
  /**
   * a NodeSelection interface so we can expose things like the objectName and the MBean's entries
   *
   * @class NodeSelection
   */
  export interface NodeSelection {
    /**
     * @property title
     * @type string
     */
    title: string;
    /**
     * @property key
     * @type string
     * @optional
     */
    key?:string;
    /**
     * @property typeName
     * @type string
     * @optional
     */
    typeName?: string;
    /**
     * @property objectName
     * @type string
     * @optional
     */
    objectName?: string;
    /**
     * @property domain
     * @type string
     * @optional
     */
    domain?: string;
    /**
     * @property entries
     * @type any
     * @optional
     */
    entries?: any;
    /**
     * @property folderNames
     * @type array
     * @optional
     */
    folderNames?: string[];
    /**
     * @property children
     * @type NodeSelection
     * @optional
     */
    children?:Array<NodeSelection>;
    /**
     * @property parent
     * @type NodeSelection
     * @optional
     */
    parent?: NodeSelection;
    /**
     * @method isFolder
     * @return {boolean}
     */
    isFolder?: () => boolean;
    /**
     * @property version
     * @type string
     * @optional
     */
    version?: string;
    /**
     * @method get
     * @param {String} key
     * @return {NodeSelection}
     */
    get(key:string): NodeSelection;
    /**
     * @method ancestorHasType
     * @param {String} typeName
     * @return {Boolean}
     */
    ancestorHasType(typeName:string): boolean;
    /**
     * @method ancestorHasEntry
     * @param key
     * @param value
     * @return {Boolean}
     */
    ancestorHasEntry(key:string, value): boolean;

    /**
     * @method findDescendant
     * @param {Function} filter
     * @return {NodeSelection}
     */
    findDescendant(filter): NodeSelection

    /**
     * @method findAncestor
     * @param {Function} filter
     * @return {NodeSelection}
     */
    findAncestor(filter): NodeSelection
  }

  /**
   * @class Folder
   * @uses NodeSelection
   */
  export class Folder implements NodeSelection {
    constructor(public title:string) {
      this.addClass = escapeTreeCssStyles(title);
    }

    key:string = null;
    typeName:string = null;
    children = <Array<NodeSelection>>[];
    folderNames:string[] = [];
    domain:string = null;
    objectName:string = null;
    map = {};
    entries = {};
    addClass:string = null;
    parent:Folder = null;
    isLazy:boolean = false;
    icon:string = null;
    tooltip:string = null;
    entity:any = null;
    version:string = null;
    mbean:JMXMBean = null;

    get(key:string):NodeSelection {
      return this.map[key];
    }

    isFolder() {
      return this.children.length > 0;
    }
    /**
     * Navigates the given paths and returns the value there or null if no value could be found
     * @method navigate
     * @for Folder
     * @param {Array} paths
     * @return {NodeSelection}
     */
    public navigate(...paths:string[]):NodeSelection {
      var node:NodeSelection = this;
      paths.forEach((path) => {
        if (node) {
          node = node.get(path);
        }
      });
      return node;
    }

    public hasEntry(key:string, value) {
      var entries = this.entries;
      if (entries) {
        var actual = entries[key];
        return actual && value === actual;
      }
      return false;
    }

    public parentHasEntry(key:string, value) {
      if (this.parent) {
        return this.parent.hasEntry(key, value);
      }
      return false;
    }

    public ancestorHasEntry(key:string, value) {
      var parent = this.parent;
      while (parent) {
        if (parent.hasEntry(key, value))
          return true;
        parent = parent.parent;
      }
      return false;
    }

    public ancestorHasType(typeName:string) {
      var parent = this.parent;
      while (parent) {
        if (typeName === parent.typeName)
          return true;
        parent = parent.parent;
      }
      return false;
    }

    public getOrElse(key:string, defaultValue:NodeSelection = new Folder(key)):Folder {
      var answer = this.map[key];
      if (!answer) {
        answer = defaultValue;
        this.map[key] = answer;
        this.children.push(answer);
        answer.parent = this;
      }
      return answer;
    }

    public sortChildren(recursive: boolean)  {
      var children = this.children;
      if (children) {
        this.children = children.sortBy("title");
        if (recursive) {
          angular.forEach(children, (child) => child.sortChildren(recursive));
        }
      }
    }

    public moveChild(child: Folder) {
      if (child && child.parent !== this) {
        child.detach();
        child.parent = this;
        this.children.push(child);
      }
    }

    public insertBefore(child: Folder, referenceFolder: Folder) {
      child.detach();
      child.parent = this;
      var idx = _.indexOf(this.children, referenceFolder);
      if (idx >= 0) {
        this.children.splice(idx, 0, child);
      }
    }

    public insertAfter(child: Folder, referenceFolder: Folder) {
      child.detach();
      child.parent = this;
      var idx = _.indexOf(this.children, referenceFolder);
      if (idx >= 0) {
        this.children.splice(idx + 1, 0, child);
      }
    }

    /**
     * Removes this node from my parent if I have one
     * @method detach
     * @for Folder
  \   */
    public detach() {
      var oldParent = this.parent;
      if (oldParent) {
        var oldParentChildren = oldParent.children;
        if (oldParentChildren) {
          var idx = oldParentChildren.indexOf(this);
          if (idx < 0) {
            oldParent.children = <NodeSelection[]>oldParent.children.remove({key: this.key});
          } else {
            oldParentChildren.splice(idx, 1);
          }
        }
        this.parent = null;
      }
    }

    /**
     * Searches this folder and all its descendants for the first folder to match the filter
     * @method findDescendant
     * @for Folder
     * @param {Function} filter
     * @return {Folder}
     */
    public findDescendant(filter) {
      if (filter(this)) {
        return this;
      }
      var answer = null;
      angular.forEach(this.children, (child) => {
        if (!answer) {
          answer = child.findDescendant(filter);
        }
      });
      return answer;
    }

    /**
     * Searches this folder and all its ancestors for the first folder to match the filter
     * @method findDescendant
     * @for Folder
     * @param {Function} filter
     * @return {Folder}
     */
    public findAncestor(filter) {
      if (filter(this)) {
        return this;
      }

      if (this.parent != null) {
        return this.parent.findAncestor(filter);
      } else {
        return null;
      }
    }

  }
}

// TODO refactor code using these two classes
interface NodeSelection extends Core.NodeSelection{};
class Folder extends Core.Folder {};

