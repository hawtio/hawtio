## hawtio release guide

The following walks through how we make a release.

* Pop onto [IRC]() and let folks know you're about to cut a release
* Now pull and make sure things build locally fine first :)

		mvn release:prepare -P release

The tag should get auto-defaulted to something like **hawtio-1.0**

		mvn release:perform -P release

when the release is done:

		git push --tags

Now go to the [OSS Nonatype Nexus](https://oss.sonatype.org/index.html#stagingRepositories) and Close then Release the staging repo


