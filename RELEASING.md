## Release Guide

The following walks through how we make a release.

- [Before releasing](#before-releasing)
- [Releasing](#releasing)
- [After releasing](#after-releasing)

### Before releasing

Pop onto [IRC](https://hawt.io/community/) and let folks know you are about to cut a release.

Also, pull `main` and make sure things build locally fine first.

#### Sonatype OSSRH Account

Hawtio relies on Sonatype OSSRH (OSS Repository Hosting) for releasing, so you need to have an account and be given the access right to the project.

If you haven't got it yet, follow this guide to acquire it:
https://central.sonatype.org/pages/ossrh-guide.html

Once you get the account, set up your default Maven settings (`$HOME/.m2/settings.xml`) with the Sonatype credentials and GPG passphrase to use for releasing:

```xml
    <servers>
        <server>
            <id>oss-sonatype-staging</id>
            <username>myuser</username>
            <password>mypassword</password>
        </server>
        <server>
            <id>oss-sonatype-snapshots</id>
            <username>myuser</username>
            <password>mypassword</password>
        </server>
    </servers>

    <profiles>
        <profile>
            <id>release</id>
            <properties>
                <gpg.passphrase>mypassphrase</gpg.passphrase>
            </properties>
        </profile>
    </profiles>
```

### Releasing

Use the [two scripts](bin/) for releasing a version of Hawtio:

* `release`
```
./bin/release
Use this script to release a Hawtio version from the snapshot main branch.

Usage:
  release <release_version> <next_snapshot_version> [path to m2 settings file]
```

* `release-from-tag`
```
./bin/release-from-tag
Use this script to release a Hawtio version from an existing tag.
It is normally used when a tag has been published to GitHub but
releasing it to OSSRH has failed for some reason.

Usage:
  release-from-tag <release_version> [path to m2 settings file]
```

So, for example, if you want to release version `2.8.0` then normally all you need to do is run the following command:
```
./bin/release 2.8.0 2.9-SNAPSHOT
```

### After releasing

Go to [GitHub releases page](https://github.com/hawtio/hawtio/releases) and draft a new release based on the tag you have just released (e.g. `hawtio-2.8.0`) with release notes, then publish it.

Finally tweet the new release from [@hawtio](https://twitter.com/hawtio) to let the community know!
