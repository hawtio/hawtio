# Hawtio Spring Boot 2 Authentication Example

Sample application for Hawtio + Spring Boot 2 with authentication enabled.

## How to run

Run with

    mvn spring-boot:run

Browse Hawtio using the url: http://localhost:10001/actuator/hawtio/index.html

Log in with user: `hawtio` password: `hawtio`

## `hawtconfig.json` customisation

This example also illustrates how to provide a custom `hawtconfig.json` so that you can customise the application branding (title & logo) and login page information on Spring Boot.

See [src/main/webapp/hawtconfig.json](src/main/webapp/hawtconfig.json).

```
{
  "branding": {
    "appName": "Hawtio Spring Boot 2 Authentication Example",
    "appLogoUrl": "img/hawtio-logo.svg",
    "companyLogoUrl": "img/hawtio-logo.svg",
    "css": "/app.css",
    "favicon": "/img/favicon.ico"
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
