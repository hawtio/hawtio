module Dashboard {

  /**
   * Provides an interface to interacting with some kind of Git like
   * file and source control system which is versioned
   */
  export interface Git {
    /**
     * Read the contents of a directory
     */
            contents: (path:string, fn) => void;

    /**
     * Read the contents of a file
     */
            read: (path:string, fn) => void;

    /**
     * Write the content of a file
     */
            write: (path:string, commitMessage:string, contents:string, fn) => void;

    /**
     * Removes a file if it exists
     */
            remove: (path:string, commitMessage:string, fn)  => void;

    /**
     * Returns the user name
     */
    getUserName: () => string;

    /**
     * Returns the user's email address
     */
    getUserEmail: () => string;
  }

  /**
   * A default implementation which uses jolokia and the
   * GitFacadeMXBean over JMX
   */
  export class JolokiaGit implements Git {
    constructor(public mbean:string, public jolokia, public localStorage, public branch = "master") {
    }

    public contents(path:string, fn) {
      this.jolokia.execute(this.mbean, "contents", path, onSuccess(fn));
    }

    public read(path:string, fn) {
      this.jolokia.execute(this.mbean, "read", this.branch, path, onSuccess(fn));
    }

    public write(path:string, commitMessage:string, contents:string, fn) {
      var authorName = this.getUserName();
      var authorEmail = this.getUserEmail();

      this.jolokia.execute(this.mbean, "write", this.branch, path, commitMessage, authorName, authorEmail, contents, onSuccess(fn));
    }

    public remove(path:string, commitMessage:string, fn) {
      var authorName = this.getUserName();
      var authorEmail = this.getUserEmail();

      this.jolokia.execute(this.mbean, "remove", this.branch, path, commitMessage, authorName, authorEmail, onSuccess(fn));
    }

    // TODO move...

    public getUserName(): string {
      return this.localStorage["gitUserName"] || "anonymous";
    }

    public getUserEmail(): string {
      return this.localStorage["gitUserEmail"] || "anonymous@gmail.com";
    }
  }
}