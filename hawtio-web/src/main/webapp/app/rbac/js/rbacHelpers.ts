/**
 * @module RBAC
 */
module RBAC {

  export function flattenMBeanTree(mbeans, tree) {
    if (!Core.isBlank(tree.objectName)) {
      mbeans[tree.objectName] = tree;
    }
    if (tree.children && tree.children.length > 0) {
      tree.children.forEach((child) => {
        flattenMBeanTree(mbeans, child);
      });
    }
  }

  export function stripClasses(css:string):string {
    if (Core.isBlank(css)) {
      return css;
    }
    var parts = css.split(" ");
    var answer = [];
    parts.forEach((part) => {
      if (part !== "can-invoke" || part !== "cant-invoke") {
        answer.push(part);
      }
    });
    return answer.join(" ").trim();
  }

  export function addClass(css:string, _class:string):string {
    if (Core.isBlank(css)) {
      return _class;
    }
    var parts = css.split(" ");
    parts.push(_class);
    return parts.unique().join(" ").trim();
  }

}
