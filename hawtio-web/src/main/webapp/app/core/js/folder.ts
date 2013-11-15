// Lets use a NodeSelection interface so we can expose things like the objectName and the MBean's entries
interface NodeSelection {
  title: string;
  key?:string;
  typeName?: string;
  objectName?: string;
  domain?: string;
  entries?: any;

  folderNames?: string[];
  children?:NodeSelection[];
  parent?: NodeSelection;
  isFolder?: () => boolean;

  get(key:string): NodeSelection;

  ancestorHasType(typeName:string): boolean;
  ancestorHasEntry(key:string, value): boolean;
}


class Folder implements NodeSelection {
  constructor(public title:string) {
    this.addClass = escapeTreeCssStyles(title);
  }

  key:string = null;
  typeName:string = null;
  children:NodeSelection[] = [];
  folderNames:string[] = [];
  domain:string = null;
  objectName:string = null;
  map = {};
  entries = {};
  addClass = null;
  parent: Folder = null;
  isLazy: boolean = false;
  icon: string = null;
  tooltip: string = null;
  entity: any = null;

  get(key:string):NodeSelection {
    return this.map[key];
  }

  isFolder() {
    return this.children.length > 0;
  }
  /**
   * Navigates the given paths and returns the value there or null if no value could be found
   */
  public navigate(...paths:string[]) {
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
      this.children = this.children.sortBy("title");
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

  /**
   * Removes this node from my parent if I have one
   */
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

}
