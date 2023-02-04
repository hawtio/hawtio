# Hawtio Spring Boot 2 Authentication Example (jar)

A JAR version of [sample application for Hawtio + Spring Boot 2 with authentication enabled](../springboot-authentication).

This example demonstrates how you can customise `hawtconfig.json` with Spring Boot jar application instead of war.

## How to run

Run with

    mvn spring-boot:run

Browse Hawtio using the url: http://localhost:10001/actuator/hawtio/index.html

Log in with user: `hawtio` password: `hawtio`

## `hawtconfig.json` customisation in Spring Boot jar

The most important difference is that you need to put static web resources under `src/main/resources/hawtio-static` instead of `src/main/webapp`. You cannot use `src/main/webapp` for Spring Boot jar application.

The classpath `classpath:/hawtio-static/*` is a special classpath for Hawtio Spring Boot support, which is similar to `classpath:static/*` in Spring Boot but exposes static resources under the Hawtio context (default to `/actuator/hawtio/`).

A custom plugin js needs to be put under `hawtio-static/app/`. It is then accessible at http://localhost:10001/actuator/hawtio/plugins/**/*.js (note `app/` is replaced with `plugins/` in the real path). Also, CSS and images need to be put under `hawtio-static/css/` and `hawtio-static/img/` respectively. It is necessary because Hawtio redirects requests to paths other than `css/`, `img/`, `fonts/`, and `plugins/` to `index.html`.

See [src/main/resources/hawtio-static/hawtconfig.json](src/main/resources/hawtio-static/hawtconfig.json).

```json
{
  "branding": {
    "appName": "Hawtio Spring Boot 2 Authentication Example",
    "appLogoUrl": "img/hawtio-logo.svg",
    "companyLogoUrl": "img/hawtio-logo.svg",
    "css": "css/app.css",
    "favicon": "img/favicon.ico"
  },
  "login": {
    "description": "This is placeholder text only. Use this area to place any information or introductory message about your application that may be relevant to users.",
    "links": [
      {
        "url": "#terms",
        "text": "Terms of use"
      },
      {
        "url": "#help",
        "text": "Help"
      },
      {
        "url": "#privacy",
        "text": "Privacy policy"
      }
    ]
  },
  "about": {
    "title": "Hawtio Spring Boot 2 Authentication Example",
    "productInfo": [],
    "additionalInfo": "",
    "copyright": "(c) 2019 Hawtio team",
    "imgSrc": "img/hawtio-logo.svg"
  },
  "disabledRoutes": []
}
```
