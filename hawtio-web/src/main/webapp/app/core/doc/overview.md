### Welcome to <img class='no-shadow' src='img/logo.png'>hawtio ###

Don't cha wish your console was <a href="http://www.youtube.com/watch?v=YNSxNsr4wmA">hawt like me</a>? I'm <i>hawt</i> so you can stay cool!

<b>hawtio</b> is a lightweight and <a href="http://hawt.io/plugins/index.html">modular</a> HTML5 web console with <a href="http://hawt.io/plugins/index.html">lots of plugins</a> for managing your Java stuff

##### General Navigation #####
Primary navigation in [hawtio](http://hawt.io "hawtio") is via the top navigation bar.

![Main Navigation Bar](app/core/doc/img/main-nav.png "Main Navigation Bar")

Clicking on a navigation link will take you to that plugin's main page.

<i class='yellow text-shadowed icon-warning-sign'></i> **Note:** The available links in the navigation bar depend on what plugins are available and what JMX MBeans are available in the JVM, and so may differ from what is shown here.

##### Getting Help #####
Click the Help icon (<i class='icon-question-sign'></i>) in the main navigation bar to access [hawtio](http://hawt.io "hawtio")'s help system. Browse the available help topics for plugin-specific documentation using the help navigation bar on the left.

![Help Topic Navigation Bar](app/core/doc/img/help-topic-nav.png "Help Topic Navigation Bar")

Available sub-topics for each plugin can be selected via the secondary navigation bar above the help display area.

![Help Sub-Topic Navigation Bar](app/core/doc/img/help-subtopic-nav.png "Help Sub-Topic Navigation Bar")

##### Preferences #####
Click the Preferences icon (<i class='icon-cogs'></i>) in the main navigation bar to access the [Preferences](#/preferences) page.  Available configuration options are:

###### General ######
- **Update Rate** - How often [hawtio](http://hawt.io "hawtio") polls the [Jolokia](http://jolokia.org) backend for JMX metrics.  Can be set to "No Refreshes" and intervals of 1, 2, 5 and 30 seconds.

  <i class='yellow text-shadowed icon-warning-sign'></i> **Note:** Setting this to "No Refreshes" will disable charting, as charting requires fetching periodic metric updates.
- **Go to server** - Connect this [hawtio](http://hawt.io "hawtio") frontend instance to a different [Jolokia](http://jolokia.org) backend.
- **Auto Refresh** - Automatically refresh the browser window if [hawtio](http://hawt.io "hawtio") detects a change in available plugins.

###### git ######
- **User Name** - The git username to use when committing updates to the [Dashboard](#/help/dashboard/) or [Wiki](#/help/wiki).
- **Email address** - The e-mail address to associate with git commits.

###### Code Editor ######
- **Theme** - The theme to be used by the CodeMirror code editor
- **Tab Size** - The tabstop size to be used by the CodeMirror code editor.


##### Further Reading #####
- [hawtio](http://hawt.io "hawtio") website
- Chat with the hawtio team on IRC by joining **#hawtio** on **irc.freenode.net**
- Help improve [hawtio](http://hawt.io "hawtio") by [contributing](http://hawt.io/contributing/index.html)
- [hawtio on github](https://github.com/hawtio/hawtio)





