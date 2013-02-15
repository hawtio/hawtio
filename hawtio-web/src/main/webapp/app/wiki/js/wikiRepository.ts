module Wiki {

  export interface WikiRepository {
    putPage: (path:string, contents:string, commitMessage:string, fn) => void;

    deletePage: (path:string, fn) => void;
  }

  export class GitWikiRepository implements WikiRepository {
    public directoryPrefix = "wiki/";

    constructor(public factoryMethod:() => Git.GitRepository) {
    }

    public getPage(path:string, objectId:string, fn) {
      if (objectId) {
        var blobPath = this.getLogPath(path);
        // TODO deal with versioned directories?
        this.git().getContent(objectId, blobPath, (content) => {
          var details = {
            text: content,
            directory: false
          };
          fn(details);
        });
      } else {
        var fullPath = this.getPath(path);
        this.git().read(fullPath, (details) => {

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

    /**
     * Performs a diff on the versions
     */
    public diff(objectId:string, baseObjectId: string, path:string, fn) {
      var fullPath = this.getLogPath(path);
      this.git().diff(objectId, baseObjectId, fullPath, (content) => {
        var details = {
          text: content,
          format: "diff",
          directory: false
        };
        fn(details);
      });
    }

    public putPage(path:string, contents:string, commitMessage:string, fn) {
      var fullPath = this.getPath(path);
      this.git().write(fullPath, commitMessage, contents, fn);
    }

    public deletePage(path:string, fn) {
      var fullPath = this.getPath(path);
      var commitMessage = "Removing wiki page " + path;
      this.git().remove(fullPath, commitMessage, fn);
    }

    /**
     * Returns the full path to use in the git repo
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
     */
    public history(objectId:string, path:string, limit:number, pageOffset:number, showRemoteRefs:bool, itemsPerPage:number, fn) {
      var fullPath = this.getLogPath(path);
      this.git().history(objectId, fullPath, limit, pageOffset, showRemoteRefs, itemsPerPage, fn);
    }

    /**
     * Returns the commit log
     */
    public log(objectId:string, path:string, limit:number, pageOffset:number, showRemoteRefs, itemsPerPage:number, fn) {
      var fullPath = this.getLogPath(path);
      this.git().log(objectId, fullPath, limit, pageOffset, showRemoteRefs, itemsPerPage, fn);
    }

    /**
     * Get the contents of a blobPath for a given commit objectId
     */
    public getContent(objectId:string, blobPath:string, fn) {
      var fullPath = this.getLogPath(blobPath);
      this.git().getContent(objectId, fullPath, fn);
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
