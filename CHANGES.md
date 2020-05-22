## Change Log

#### 2.11.0 (To be released)

* Upgrade to Spring Boot 2.3.0 / Spring Framework 5.2.6

#### 2.10.0

* Add config property `hawtio.disableProxy`. With this property set to `true`,
  you can disable `ProxyServlet` (`/hawtio/proxy/*`) completely. (Default: `false`)
* Support custom styles and background image via `hawtconfig.json`.
  See [branding-plugin](examples/branding-plugin) and [springboot-authentication](examples/springboot-authentication) examples for more details.
* Bug fixes

#### 2.9.1

* Support Karaf 4.3.0

#### 2.9.0

* Support login page customisation through `hawtconfig.json`.
  Now you can add custom description and links to the standard login page as follows:
  
      {
        ...
        "login": {
          "description": "This is placeholder text only. Use this area to place any information or introductory message about your application that may be relevant to users.",
          "links": [
            {
              "url": "#",
              "text": "Terms of use"
            },
            {
              "url": "#",
              "text": "Help"
            },
            {
              "url": "#",
              "text": "Privacy policy"
            }
          ]
        },
        ...
      }
* `hawtconfig.json` is now customisable through a custom plugin.
  See [branding-plugin](examples/branding-plugin) and [springboot-authentication](examples/springboot-authentication) examples.
* Support Spring Security and Keycloak authentications on Spring Boot.
  See [springboot-security](examples/springboot-security) and [springboot-keycloak](examples/springboot-keycloak) examples.
* Upgrade to Spring Boot 2.2.2 / Spring Framework 5.2.2
* Bug fixes

#### 2.8.0

* Dynamic custom plugin support [#2508](https://github.com/hawtio/hawtio/issues/2508)
* Add custom plugin example [simple-plugin](examples/simple-plugin)

#### 2.7.1

* Bug fixes

#### 2.7.0

* Upgrade Camel to 2.24.1
* Upgrade Hawtio components
* Upgrade Jolokia to 1.6.2
* Bug fixes

#### 2.6.0

* Fix memory leak with sidemenu visible in v2.5.0 [#2573](https://github.com/hawtio/hawtio/issues/2573)
* Apply Pattern Fly 4 styles to masthead, sidebar, and login page
* Upgrade to Spring Boot 2.1.4 / Spring Framework 5.1.6
* Upgrade Hawtio components
* Bug fixes

#### 2.5.0

* Add config property `hawtio.localAddressProbing`. Now you can disable local address probing
  for proxy whitelist upon startup by setting this property to `false` (default: `true`).
* Upgrade Camel to 2.23.1
* Upgrade Spring Framework to 5.1.3
* Upgrade Spring Boot to 2.1.2
* Bug fixes

#### 2.4.0

* Support Java 11
* Upgrade @hawtio/integration, @hawtio/jmx to 4.2.x
* Upgrade Spring Boot to 2.1.1

#### 2.3.0

* Add support for Spring Boot 2
  **Note:** Spring Boot 2 is now the default Spring Boot version for Hawtio dependency `hawtio-spring-boot`.
  If Spring Boot 1 is required, use dependency `hawtio-spring-boot-1`.
* Bug fixes

#### 2.2.0

* Upgrade Hawtio components to 4.1.x
* Minor improvements
* Bug fixes

#### 2.1.0

* Upgrade Hawtio components to 4.0.x
* Upgrade AngularJS to 1.7.x
* Improve security-releated HTTP headers handling
* Bug fixes

#### 2.0.3

- #2488: Allow using SSL by specifying a keyStore and keyStorePass from embedded Hawtio

#### 2.0.2

* **Official Hawtio v2 GA version!**

#### 2.0.0, 2.0.1

* These are old versions that were mistakenly released years ago. Please don't use these versions!

#### 2.0 Beta3 (To be released)

* Added hawtio BOM

#### 2.0 Beta2

* Keycloak integration support
* Bug fixes

#### 2.0 Beta1

* hawtio Maven plugin
* Improved Spring Boot support
* Log plugin
* Diagnostics plugin
* Karaf RBAC support
* PatternFly-based login page and logo
* Upgrade to Servlet API 3.1
* Port fixes from hawtio v1
* Bug fixes

#### 2.0 M3

* Switch from bower to yarn
* Help plugin
* Port fixes from hawtio v1

#### 2.0 M2

* Migrate to PatternFly
* Bug fixes
* Port fixes from hawtio v1

#### 2.0 M1

* Initial 2.0 milestone release

-----

#### 1.x

See: https://github.com/hawtio/hawtio/blob/1.x/CHANGES.md
