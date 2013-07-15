module Git {

  /**
   * Provides an interface to interacting with some kind of Git like
   * file and source control system which is versioned
   */
  export interface GitRepository {
    /**
     * Read the contents of a file or directory
     * with text or children being returned and a directory flag
     */
    read(branch:string, path:string, fn): void;

    /**
     * Write the content of a file
     */
    write(branch:string, path:string, commitMessage:string, contents:string, fn): void;

    /**
     * Reverts to a specific version of the file
     */
    revertTo(objectId:string, blobPath:string, commitMessage:string, fn): void;

    /**
     * Removes a file if it exists
     */
    remove(branch:string, path:string, commitMessage:string, fn): void;


    /**
     * returns the commit history of a directory or file
     */
    history(objectId:string, path:string, limit:number, fn): void;

    /**
     * Get the contents of a blobPath for a given commit objectId
     */
    getContent(objectId:string, blobPath:string, fn): void;

    /**
     * Get the JSON contents of children in a directory matching a name wildcard and content search
     */
    readJsonChildContent(path:string, nameWildcard:string, search:string, fn): void;

    /**
     * Returns the diff of this commit verses the previous or another commit
     */
    diff(objectId:string, baseObjectId:string, path:string, fn): void;

    /**
     * Returns the user name
     */
    getUserName(): string;

    /**
     * Returns the user's email address
     */
    getUserEmail(): string;
  }

  /**
   * A default implementation which uses jolokia and the
   * GitFacadeMXBean over JMX
   */
  export class JolokiaGit implements GitRepository {
    constructor(public mbean:string, public jolokia, public localStorage, public branch = "master") {
    }

    public read(branch:string, path:string, fn) {
      this.jolokia.execute(this.mbean, "read", branch, path, onSuccess(fn));
    }

    public write(branch:string, path:string, commitMessage:string, contents:string, fn) {
      var authorName = this.getUserName();
      var authorEmail = this.getUserEmail();

      this.jolokia.execute(this.mbean, "write", this.branch, path, commitMessage, authorName, authorEmail, contents, onSuccess(fn));
    }

    public revertTo(objectId:string, blobPath:string, commitMessage:string, fn) {
      var authorName = this.getUserName();
      var authorEmail = this.getUserEmail();

      this.jolokia.execute(this.mbean, "revertTo", this.branch, objectId, blobPath, commitMessage, authorName, authorEmail, onSuccess(fn));
    }

    public remove(branch:string, path:string, commitMessage:string, fn) {
      var authorName = this.getUserName();
      var authorEmail = this.getUserEmail();

      this.jolokia.execute(this.mbean, "remove", branch, path, commitMessage, authorName, authorEmail, onSuccess(fn));
    }

    /**
     * Return the history of the repository or a specific directory or file path
     */
    public history(objectId:string, path:string, limit:number, fn) {
      this.jolokia.execute(this.mbean, "history", objectId, path, limit, onSuccess(fn));
    }

    /**
     * Returns a diff
     */
    public diff(objectId:string, baseObjectId:string, path:string, fn) {
      this.jolokia.execute(this.mbean, "diff", objectId, baseObjectId, path, onSuccess(fn));
    }

    /**
     * Get the contents of a blobPath for a given commit objectId
     */
    public getContent(objectId:string, blobPath:string, fn) {
      this.jolokia.execute(this.mbean, "getContent", objectId, blobPath, onSuccess(fn));
    }


    /**
     * Get the JSON contents of children in a directory matching a name wildcard and content search
     */
    public readJsonChildContent(path:string, nameWildcard:string, search:string, fn) {
      this.jolokia.execute(this.mbean, "readJsonChildContent", this.branch, path, nameWildcard, search, onSuccess(fn));
    }


    // TODO move...

    public getUserName():string {
      return this.localStorage["gitUserName"] || "anonymous";
    }

    public getUserEmail():string {
      return this.localStorage["gitUserEmail"] || "anonymous@gmail.com";
    }
  }
}