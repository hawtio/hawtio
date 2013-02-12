module Wiki {

  export interface WikiRepository {
    putPage: (path:string, contents:string, commitMessage:string, fn) => void;

    deletePage: (path:string, fn) => void;
  }

  export class GitWikiRepository implements WikiRepository {
    constructor(public git:Git.GitRepository) {
    }

    public getPage(path:string, fn) {
      var fullPath = this.getPath(path);
      this.git.read(fullPath, fn);
    }

    public putPage(path:string, contents:string, commitMessage:string, fn) {
      var fullPath = this.getPath(path);
      this.git.write(fullPath, commitMessage, contents, fn);
    }

    public deletePage(path:string, fn) {
      var fullPath = this.getPath(path);
      var commitMessage = "Removing wiki page " + path;
      this.git.remove(fullPath, commitMessage, fn);
    }

    /**
     * Returns the full path to use in the git repo
     */
    public getPath(path:string) {
      return "wiki/" + path;
    }
  }
}
