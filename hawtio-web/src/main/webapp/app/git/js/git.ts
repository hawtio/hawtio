module Git {

  /**
   * Provides an interface to interacting with some kind of Git like
   * file and source control system which is versioned
   */
  export interface GitRepository {

    /**
     * Returns the file metadata if the file or directory exists or null if it does not exist
     */
    exists(branch:string, path:string, fn);

    /**
     * Read the contents of a file or directory
     * with text or children being returned and a directory flag
     */
    read(branch:string, path:string, fn);

    /**
     * Completes the available path or file names given the branch and completion text
     */
    completePath(branch:string, completionText:string, directoriesOnly:boolean, fn);

    /**
     * Write the content of a file
     */
    write(branch:string, path:string, commitMessage:string, contents:string, fn);

    /**
     * Reverts to a specific version of the file
     */
    revertTo(objectId:string, blobPath:string, commitMessage:string, fn);

    /**
     * Renames a file or moves a file to a new location
     */
    rename(branch:string, oldPath:string, newPath:string, commitMessage:string, fn);

    /**
     * Removes a file if it exists
     */
    remove(branch:string, path:string, commitMessage:string, fn);


    /**
     * returns the commit history of a directory or file
     */
    history(objectId:string, path:string, limit:number, fn);

    /**
     * Get the contents of a blobPath for a given commit objectId
     */
    getContent(objectId:string, blobPath:string, fn);

    /**
     * Get the JSON contents of children in a directory matching a name wildcard and content search
     */
    readJsonChildContent(path:string, nameWildcard:string, search:string, fn);

    /**
     * Returns the diff of this commit verses the previous or another commit
     */
    diff(objectId:string, baseObjectId:string, path:string, fn);

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

    public exists(branch:string, path:string, fn) {
      return this.jolokia.execute(this.mbean, "exists", branch, path, onSuccess(fn));
    }

    public read(branch:string, path:string, fn) {
      return this.jolokia.execute(this.mbean, "read", branch, path, onSuccess(fn));
    }

    public write(branch:string, path:string, commitMessage:string, contents:string, fn) {
      var authorName = this.getUserName();
      var authorEmail = this.getUserEmail();

      return this.jolokia.execute(this.mbean, "write", this.branch, path, commitMessage, authorName, authorEmail, contents, onSuccess(fn));
    }

    public revertTo(objectId:string, blobPath:string, commitMessage:string, fn) {
      var authorName = this.getUserName();
      var authorEmail = this.getUserEmail();

      return this.jolokia.execute(this.mbean, "revertTo", this.branch, objectId, blobPath, commitMessage, authorName, authorEmail, onSuccess(fn));
    }

    public rename(branch:string, oldPath: string, newPath:string, commitMessage:string, fn) {
      var authorName = this.getUserName();
      var authorEmail = this.getUserEmail();

      return this.jolokia.execute(this.mbean, "rename", branch, oldPath, newPath, commitMessage, authorName, authorEmail, onSuccess(fn));
    }

    public remove(branch:string, path:string, commitMessage:string, fn) {
      var authorName = this.getUserName();
      var authorEmail = this.getUserEmail();

      return this.jolokia.execute(this.mbean, "remove", branch, path, commitMessage, authorName, authorEmail, onSuccess(fn));
    }

    /**
     * Completes the available path or file names given the branch and completion text
     */
    public completePath(branch:string, completionText:string, directoriesOnly:boolean, fn) {
      return this.jolokia.execute(this.mbean, "completePath", branch, completionText, directoriesOnly, onSuccess(fn));
    }

    /**
     * Return the history of the repository or a specific directory or file path
     */
    public history(objectId:string, path:string, limit:number, fn) {
      return this.jolokia.execute(this.mbean, "history", objectId, path, limit, onSuccess(fn));
    }

    /**
     * Returns a diff
     */
    public diff(objectId:string, baseObjectId:string, path:string, fn) {
      return this.jolokia.execute(this.mbean, "diff", objectId, baseObjectId, path, onSuccess(fn));
    }

    /**
     * Get the contents of a blobPath for a given commit objectId
     */
    public getContent(objectId:string, blobPath:string, fn) {
      return this.jolokia.execute(this.mbean, "getContent", objectId, blobPath, onSuccess(fn));
    }


    /**
     * Get the JSON contents of children in a directory matching a name wildcard and content search
     */
    public readJsonChildContent(path:string, nameWildcard:string, search:string, fn) {
      return this.jolokia.execute(this.mbean, "readJsonChildContent", this.branch, path, nameWildcard, search, onSuccess(fn));
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