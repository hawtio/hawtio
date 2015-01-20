/**
 * @module Wiki
 */
module Wiki {

  /**
   * @class WikiRepository
   */
  export interface WikiRepository {
    getRepositoryLabel(fn, error);
    putPage(branch:string, path:string, contents:string, commitMessage:string, fn): void;
    putPageBase64(branch:string, path:string, contents:string, commitMessage:string, fn): void;

    removePage(branch:string, path:string, commitMessage:string, fn): void;
  }

  /**
   * @class GitWikiRepository
   */
  export class GitWikiRepository implements WikiRepository {
    public directoryPrefix = "";

    constructor(public factoryMethod:() => Git.GitRepository) {
    }

    public getRepositoryLabel(fn, error) {
      this.git().getRepositoryLabel(fn, error);
    }

    public exists(branch:string, path:string, fn): Boolean {
      var fullPath = this.getPath(path);
      return this.git().exists(branch, fullPath, fn);
    }

    public completePath(branch:string, completionText:string, directoriesOnly:boolean, fn) {
      return this.git().completePath(branch, completionText, directoriesOnly, fn);
    }

    public getPage(branch:string, path:string, objectId:string, fn) {
      var git = this.git();
      path = path || "/";
      if (git) {
        if (objectId) {
          var blobPath = this.getLogPath(path);
          // TODO deal with versioned directories?
          git.getContent(objectId, blobPath, (content) => {
            var details = {
              text: content,
              directory: false
            };
            fn(details);
          });
        } else {
          var fullPath = this.getPath(path);
          git.read(branch, fullPath, (details) => {

            // lets fix up any paths to be relative to the wiki
            var children = details.children;
            angular.forEach(children, (child) => {
              var path = child.path;
              if (path) {
                var directoryPrefix = "/" + this.directoryPrefix;
                if (path.startsWith(directoryPrefix)) {
                  path = "/" + path.substring(directoryPrefix.length);
                  child.path = path;
                }
              }
            });
            fn(details);
          });
        }
      }
      return git;
    }

    /**
     * Performs a diff on the versions
     * @method diff
     * @for GitWikiRepository
     * @param {String} objectId
     * @param {String} baseObjectId
     * @param {String} path
     * @param {Function} fn
     * @return {any}
     */
    public diff(objectId:string, baseObjectId:string, path:string, fn) {
      var fullPath = this.getLogPath(path);
      var git = this.git();
      if (git) {
        git.diff(objectId, baseObjectId, fullPath, (content) => {
          var details = {
            text: content,
            format: "diff",
            directory: false
          };
          fn(details);
        });
      }
      return git;
    }

    public commitInfo(commitId:string, fn) {
      this.git().commitInfo(commitId, fn);
    }

    public commitTree(commitId:string, fn) {
      this.git().commitTree(commitId, fn);
    }

    public putPage(branch:string, path:string, contents:string, commitMessage:string, fn) {
      var fullPath = this.getPath(path);
      this.git().write(branch, fullPath, commitMessage, contents, fn);
    }

    public putPageBase64(branch:string, path:string, contents:string, commitMessage:string, fn) {
      var fullPath = this.getPath(path);
      this.git().writeBase64(branch, fullPath, commitMessage, contents, fn);
    }

    public createDirectory(branch:string, path:string, commitMessage:string, fn) {
      var fullPath = this.getPath(path);
      this.git().createDirectory(branch, fullPath, commitMessage, fn);
    }

    public revertTo(branch:string, objectId:string, blobPath:string, commitMessage:string, fn) {
      var fullPath = this.getLogPath(blobPath);
      this.git().revertTo(branch, objectId, fullPath, commitMessage, fn);
    }

    public rename(branch:string, oldPath:string,  newPath:string, commitMessage:string, fn) {
      var fullOldPath = this.getPath(oldPath);
      var fullNewPath = this.getPath(newPath);
      if (!commitMessage) {
        commitMessage = "Renaming page " + oldPath + " to " + newPath;
      }
      this.git().rename(branch, fullOldPath, fullNewPath, commitMessage, fn);
    }

    public removePage(branch:string, path:string, commitMessage:string, fn) {
      var fullPath = this.getPath(path);
      if (!commitMessage) {
        commitMessage = "Removing page " + path;
      }
      this.git().remove(branch, fullPath, commitMessage, fn);
    }

    /**
     * Returns the full path to use in the git repo
     * @method getPath
     * @for GitWikiRepository
     * @param {String} path
     * @return {String{
     */
    public getPath(path:string) {
      var directoryPrefix = this.directoryPrefix;
      return (directoryPrefix) ? directoryPrefix + path : path;
    }

    public getLogPath(path:string) {
      return Core.trimLeading(this.getPath(path), "/");
    }

    /**
     * Return the history of the repository or a specific directory or file path
     * @method history
     * @for GitWikiRepository
     * @param {String} branch
     * @param {String} objectId
     * @param {String} path
     * @param {Number} limit
     * @param {Function} fn
     * @return {any}
     */
    public history(branch:string, objectId:string, path:string, limit:number, fn) {
      var fullPath = this.getLogPath(path);
      var git = this.git();
      if (git) {
          git.history(branch, objectId, fullPath, limit, fn);
      }
      return git;
    }

    /**
     * Get the contents of a blobPath for a given commit objectId
     * @method getContent
     * @for GitWikiRepository
     * @param {String} objectId
     * @param {String} blobPath
     * @param {Function} fn
     * @return {any}
     */
    public getContent(objectId:string, blobPath:string, fn) {
      var fullPath = this.getLogPath(blobPath);
      var git = this.git();
      if (git) {
        git.getContent(objectId, fullPath, fn);
      }
      return git;
    }

    /**
     * Get the list of branches
     * @method branches
     * @for GitWikiRepository
     * @param {Function} fn
     * @return {any}
     */
    public branches(fn) {
      var git = this.git();
      if (git) {
        git.branches(fn);
      }
      return git;
    }


    /**
     * Get the JSON contents of the path with optional name wildcard and search
     * @method jsonChildContents
     * @for GitWikiRepository
     * @param {String} path
     * @param {String} nameWildcard
     * @param {String} search
     * @param {Function} fn
     * @return {any}
     */
    public jsonChildContents(path:string, nameWildcard:string, search:string, fn) {
      var fullPath = this.getLogPath(path);
      var git = this.git();
      if (git) {
        git.readJsonChildContent(fullPath, nameWildcard, search, fn);
      }
      return git;
    }


    public git() {
      var repository = this.factoryMethod();
      if (!repository) {
        console.log("No repository yet! TODO we should use a local impl!");
      }
      return repository;
    }
  }
}
