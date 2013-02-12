module Dashboard {

  /**
   * Provides an interface to interacting with some kind of Git like
   * file and source control system which is versioned
   */
  export interface Git {
    /**
     * Read the contents of a directory
     */
    contents: (path: string, fn) => void;

    /**
     * Read the contents of a file
     */
    read: (path: string, fn) => void;

    /**
     * Write the content of a file
     */
    write: (path: string, commitMessage: string, contents: string, fn) => void;
  }

  /**
   * A default implementation which uses jolokia and the
   * GitFacadeMXBean over JMX
   */
  export class JolokiaGit implements Git {
    constructor(public mbean: string, public jolokia, public branch = "master") {
    }

    public contents(path: string, fn) {
      this.jolokia.execute(this.mbean, "contents", path, onSuccess(fn));
    }

    public read(path: string, fn) {
      this.jolokia.execute(this.mbean, "read", this.branch, path, onSuccess(fn));
    }

    public write(path: string, commitMessage: string, contents: string, fn) {
      var authorName = Dashboard.getGitUserName();
      var authorEmail = Dashboard.getGitUserEmail();

      this.jolokia.execute(this.mbean, "write", this.branch, path, commitMessage, authorName, authorEmail, contents, onSuccess(fn));
    }

    // TODO move and remove...
  }
}