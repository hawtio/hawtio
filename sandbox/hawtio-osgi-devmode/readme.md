the hawtio dev mode OSGi managed service factory

This module can be installed and then configured to serve out arbitrary filesystem locations via pax-web.

under "profiles" are two profile exports from FMC that configure your fabric to deploy this module and a configuration file.  To use it:

1)  Build the fuse project and extract the fuse-fabric distro right in it's target directory
2)  Run ./bin/fusefabric
3)  Do fabric:create -p fmc 
4)  Log into FMC and go to the "Profiles" tab.
5)  Use the "Import Profile" button to import all three .zip files under the "profiles" directory.
6)  Importing the karaf export will restart your container most likely.  Add hawtio-osgi-devmode and hawtio-web profiles to your container

In general to use the hawtio-osgi-dev managed service factory you can create new entries in the "Configurations" tab of FMC, for example create:

hawtiodev-foobar.properties

and then edit this configuration and add:

context=/foobar/*
content=/path/to/some/directory

and assuming there's an index.html in that directory you can go to "http://localhost/foobar/" and see your web page.

TODO - some kind of directory listing might be helpful.



