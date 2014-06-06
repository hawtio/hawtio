## hawtio release guide

The following walks through how we make a release.

* Pop onto [IRC](http://hawt.io/community/index.html) and let folks know you're about to cut a release
* Now pull and make sure things build locally fine first :)

		mvn release:prepare -P release,grunt

If the build fails then rollback via

    mvn release:rollback -P release,grunt

The tag should get auto-defaulted to something like **hawtio-1.2**

		mvn release:perform -P release,grunt

when the release is done:

		git push --tags

Now go to the [OSS Nonatype Nexus](https://oss.sonatype.org/index.html#stagingRepositories) and Close then Release the staging repo

Now, go into github issues and create a new milestone (if not already created) for the release number that you just released.  Close this milestone.  Now go through each open milestonee and move all closed issues to your new milestone.  Also move issues that are closed but have no milestone to the new milestone.  This will ensure that all fixed issues in the last development period will be correctly associated with the release that the fix was introduced in.

Update the changelog with links to your milestone which will list all the fixes/enhancements that made it into the release.  Also mention any major changes in the changelog.

### Update the new version number:

Now update the new dev version the following files so the new dev build doens't barf

  * [SpecRunner.html](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/test/specs/SpecRunner.html#L88)

Now update the following files for the new release version:

  * **/*.md - *apart* from changes.md!
  * website/pom.xml
  * website/src/chrome/extension.xml
  * chrome-extension/src/resources/manifest.json


### Chrome Extension

One the release has sync'd to [maven central](http://central.maven.org/maven2/io/hawt/hawtio-web/) and the new website is up with the new extension.xml (see above), you'll need to:

* go to the chrome-extension directory
* check the manifest has the correct new view (see above on version number changes)
* run

    mvn install

* now go to the [Chrome Web Store](https://chrome.google.com/webstore/developer/dashboard/ua69cc79bd081162fca3bb58f3e36b3b4) and upload the **target/extension.zip** file and hit publish

### Now its beer o'clock!

Now drink a beer! Then another! There, thats better now isn't it!




