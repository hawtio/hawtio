# Hawtio Spring Boot 2 Authentication Example

Sample application for Hawtio + Spring Boot 2 with authentication enabled.

## How to run

Run with

```console
mvn spring-boot:run
```

Browse Hawtio using the url: <http://localhost:10001/actuator/hawtio/index.html>

Log in with user: `hawtio` password: `hawtio`

## `hawtconfig.json` customisation

This example also illustrates how to provide a custom `hawtconfig.json` so that you can customise the application branding (title & logo) and login page information on Spring Boot.

Note that you need to put static web resources served for the Hawtio endpoint under `src/main/resources/hawtio-static`. The classpath `classpath:/hawtio-static/*` is a special classpath for Hawtio Spring Boot support, which is similar to `classpath:static/*` in Spring Boot but exposes static resources under the Hawtio context (default to `/actuator/hawtio/`).

CSS, images, and custom fonts need to be put under `hawtio-static/css/`, `hawtio-static/img/`, and `hawtio-static/fonts/` respectively. It is necessary because Hawtio redirects requests to paths other than `css/`, `img/`, and `fonts/` to `index.html`.

See: [src/main/resources/hawtio-static/hawtconfig.json](src/main/resources/hawtio-static/hawtconfig.json)

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
    "copyright": "(c) 2023 Hawtio team",
    "imgSrc": "img/hawtio-logo.svg"
  },
  "disabledRoutes": []
}
```
