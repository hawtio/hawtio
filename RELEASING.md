## Release Guide

The following walks through how we make a release.

- [Before releasing](#before-releasing)
- [Releasing](#releasing)
- [After releasing](#after-releasing)

### Before releasing

Get in touch with the [community](https://hawt.io/community/) and let folks know you are about to cut a release.

Also, pull the main branch and make sure things build locally fine first.

#### Sonatype OSSRH Account

Hawtio relies on [Sonatype Maven Central Repository Hosting](https://central.sonatype.org/) for releasing, so you need to have an account and be given the access right to the project.

If you haven't got it yet, follow this guide to acquire it:
<https://central.sonatype.org/register/central-portal/>

Once you get the account, set up your default Maven settings (`$HOME/.m2/settings.xml`) with the Sonatype credentials and GPG passphrase to use for releasing:

```xml
    <servers>
        <server>
            <id>central</id>
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

Prepare release:

```console
mvn release:prepare -Prelease
```

Then perform release:

```console
mvn release:perform -Prelease
```

### After releasing

Go to [GitHub releases page](https://github.com/hawtio/hawtio/releases) and draft a new release based on the tag you have just released (e.g. `hawtio-4.5.0`) with release notes. Upload and attach the following artifacts to the release notes:

- **hawtio-war**
  - hawtio-war-4.x.x.war
  - hawtio-war-4.x.x.war.asc
  - hawtio-war-4.x.x.war.md5
  - hawtio-war-4.x.x.war.sha1
  - hawtio-war-4.x.x.war.sha256
  - hawtio-war-4.x.x.war.sha512
- **hawtio-war-minimal**
  - hawtio-war-minimal-4.x.x.war
  - hawtio-war-minimal-4.x.x.war.asc
  - hawtio-war-minimal-4.x.x.war.md5
  - hawtio-war-minimal-4.x.x.war.sha1
  - hawtio-war-minimal-4.x.x.war.sha256
  - hawtio-war-minimal-4.x.x.war.sha512
- **hawtio-default**
  - hawtio-default-4.x.x.war
  - hawtio-default-4.x.x.war.asc
  - hawtio-default-4.x.x.war.md5
  - hawtio-default-4.x.x.war.sha1
  - hawtio-default-4.x.x.war.sha256
  - hawtio-default-4.x.x.war.sha512

Then publish it.

Finally, let the community know the release!
