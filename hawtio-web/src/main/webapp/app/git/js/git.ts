/**
 * @module Git
 * @main Git
 */
module Git {

  /**
   * Provides an interface to interacting with some kind of Git like
   * file and source control system which is versioned
   * @class GitRepository
   */
  export interface GitRepository {

    /**
     * Returns repository label
     * @method getRepositoryLabel
     * @param {Function} fn
     * @param {Function} error
     */
    getRepositoryLabel(fn, error);

    /**
     * Returns the file metadata if the file or directory exists or null if it does not exist
     * @method exists
     * @param {String} branch
     * @param {String} path
     * @param {Function} fn
     * @return is used if no function is provided to trigger a synchronous call, returns true if file exists, false otherwise
     */
    exists(branch:string, path:string, fn): Boolean;

    /**
     * Read the contents of a file or directory
     * with text or children being returned and a directory flag
     * @method read
     * @param {String} branch
     * @param {String} path
     * @param {Function} fn
     */
    read(branch:string, path:string, fn);

    /**
     * Completes the available path or file names given the branch and completion text
     * @method completePath
     * @param {String} branch
     * @param {String} completionText
     * @param {Boolean} directoriesOnly
     * @param {Function} fn
     */
    completePath(branch:string, completionText:string, directoriesOnly:boolean, fn);

    /**
     * Write the content of a file
     * @method write
     * @param {String} branch
     * @param {String} commitMessage
     * @param {String} contents
     * @param {Function} fn
     */
    write(branch:string, path:string, commitMessage:string, contents:string, fn);

    /**
     * Write the content of a file
     * @method write
     * @param {String} branch
     * @param {String} commitMessage
     * @param {String} contents
     * @param {Function} fn
     */
    writeBase64(branch:string, path:string, commitMessage:string, contents:string, fn);

    /**
     * Creates a new directory of the given name
     * @method createDirectory
     * @param {String} branch
     * @param {String} path
     * @param {String} commitMessage
     * @param {Function} fn
     */
    createDirectory(branch:string, path:string, commitMessage:string, fn);

    /**
     * Reverts to a specific version of the file
     * @method revertTo
     * @param {String} objectId
     * @param {String} blobPath
     * @param {String} commitMessage
     * @param {Function} fn
     *
     */
    revertTo(branch:string, objectId:string, blobPath:string, commitMessage:string, fn);

    /**
     * Renames a file or moves a file to a new location
     * @method rename
     * @param {String} branch
     * @param {String} oldPath
     * @param {String} newPath
     * @param {String} commitMessage
     * @param {Function} fn
     */
    rename(branch:string, oldPath:string, newPath:string, commitMessage:string, fn);

    /**
     * Removes a file if it exists
     * @method remove
     * @param {String} branch
     * @param {String} path
     * @param {String} commitMessage
     * @param {Function} fn
     */
    remove(branch:string, path:string, commitMessage:string, fn);


    /**
     * returns the commit history of a directory or file
     * @method history
     * @param {String} branch
     * @param {String} objectId
     * @param {String} path
     * @param {Number} number
     * @param {Function} fn
     */
    history(branch:string, objectId:string, path:string, limit:number, fn);

    /**
     * Get the contents of a blobPath for a given commit objectId
     * @method getContent
     * @param {String} object Id
     * @param {String} blobPath
     * @param {Function} fn
     */
    getContent(objectId:string, blobPath:string, fn);

    /**
     * Get the list of branches
     * @method branches
     * @param {Function} fn
     */
    branches(fn);

    /**
     * Get the JSON contents of children in a directory matching a name wildcard and content search
     * @method readJsonChildContent
     * @param {String} path
     * @param {String} nameWildcard
     * @param {String} search
     * @param {Function} fn
     */
    readJsonChildContent(path:string, nameWildcard:string, search:string, fn);

    /**
     * Returns the diff of this commit verses the previous or another commit
     * @method diff
     * @param {String} objectId
     * @param {String} baseObjectId
     * @param {String} path
     * @param {Function} fn
     */
    diff(objectId:string, baseObjectId:string, path:string, fn);

    /**
     * Returns a list of commit tree info objects for the given commit ID
     *
     * @method commitTree
     * @param {String} commitId
     * @param {Function} fn
     */
    commitTree(commitId:string, fn);

    /**
     * Returns details of a commit for the given commit ID
     *
     * @method commitInfo
     * @param {String} commitId
     * @param {function} fn
     */
    commitInfo(commitId:string, fn);


    /**
     * Returns the user name
     * @method getUserName
     * @return {String}
     */
    getUserName(): string;

    /**
     * Returns the user's email address
     * @method getUserEmail
     * @return {String}
     */
    getUserEmail(): string;
  }

  /**
   * A default implementation which uses jolokia and the
   * GitFacadeMXBean over JMX
   *
   * @class JolokiaGit
   * @uses GitRepository
   *
   */
  export class JolokiaGit implements GitRepository {
    constructor(public mbean:string, public jolokia, public localStorage, public userDetails, public branch = "master") {
    }

    public getRepositoryLabel(fn, error) {
      return this.jolokia.request({type: "read", mbean: this.mbean, attribute: ["RepositoryLabel"]}, onSuccess(function(result){
        fn(result.value.RepositoryLabel);
      }, {error: error}));
    }

    public exists(branch:string, path:string, fn):Boolean {
      var result;
      if (angular.isDefined(fn) && fn) {
        result = this.jolokia.execute(this.mbean, "exists", branch, path, onSuccess(fn));
      } else {
        result = this.jolokia.execute(this.mbean, "exists", branch, path);
      }
      if (angular.isDefined(result) && result) {
        return true;
      } else {
        return false;
      }
    }

    public read(branch:string, path:string, fn) {
      return this.jolokia.execute(this.mbean, "read", branch, path, onSuccess(fn));
    }

    public write(branch:string, path:string, commitMessage:string, contents:string, fn) {
      var authorName = this.getUserName();
      var authorEmail = this.getUserEmail();
      return this.jolokia.execute(this.mbean, "write", branch, path, commitMessage, authorName, authorEmail, contents, onSuccess(fn));
    }

    public writeBase64(branch:string, path:string, commitMessage:string, contents:string, fn) {
      var authorName = this.getUserName();
      var authorEmail = this.getUserEmail();
      return this.jolokia.execute(this.mbean, "writeBase64", branch, path, commitMessage, authorName, authorEmail, contents, onSuccess(fn));
    }

    public createDirectory(branch:string, path:string, commitMessage:string, fn) {
      var authorName = this.getUserName();
      var authorEmail = this.getUserEmail();

      return this.jolokia.execute(this.mbean, "createDirectory", branch, path, commitMessage, authorName, authorEmail, onSuccess(fn));
    }

    public revertTo(branch:string, objectId:string, blobPath:string, commitMessage:string, fn) {
      var authorName = this.getUserName();
      var authorEmail = this.getUserEmail();

      return this.jolokia.execute(this.mbean, "revertTo", branch, objectId, blobPath, commitMessage, authorName, authorEmail, onSuccess(fn));
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

    public completePath(branch:string, completionText:string, directoriesOnly:boolean, fn) {
      return this.jolokia.execute(this.mbean, "completePath", branch, completionText, directoriesOnly, onSuccess(fn));
    }

    public history(branch:string, objectId:string, path:string, limit:number, fn) {
      return this.jolokia.execute(this.mbean, "history", branch, objectId, path, limit, onSuccess(fn));
    }

    public commitTree(commitId:string, fn) {
      return this.jolokia.execute(this.mbean, "getCommitTree", commitId, onSuccess(fn));
    }

    public commitInfo(commitId:string, fn) {
      return this.jolokia.execute(this.mbean, "getCommitInfo", commitId, onSuccess(fn));
    }

    public diff(objectId:string, baseObjectId:string, path:string, fn) {
      return this.jolokia.execute(this.mbean, "diff", objectId, baseObjectId, path, onSuccess(fn));
    }

    public getContent(objectId:string, blobPath:string, fn) {
      return this.jolokia.execute(this.mbean, "getContent", objectId, blobPath, onSuccess(fn));
    }


    public readJsonChildContent(path:string, nameWildcard:string, search:string, fn) {
      return this.jolokia.execute(this.mbean, "readJsonChildContent", this.branch, path, nameWildcard, search, onSuccess(fn));
    }

    public branches(fn) {
      return this.jolokia.execute(this.mbean, "branches", onSuccess(fn));
    }

    // TODO move...

    public getUserName():string {
      return this.localStorage["gitUserName"] || this.userDetails.username || "anonymous";
    }

    public getUserEmail():string {
      return this.localStorage["gitUserEmail"] || "anonymous@gmail.com";
    }
  }
}
