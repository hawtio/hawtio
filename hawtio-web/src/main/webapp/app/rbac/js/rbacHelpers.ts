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

}
