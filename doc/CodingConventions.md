# Code Conventions

While we don't want to be too anal about coding styles, we are trying to adopt conventions to help make things easier to find, name, navigate and use.

Here's a few of them we've found over time...

## Plugin Layout

Each plugin should have its own directory tree with optional child folders called:

* `html` for any HTML partials or layouts
* `js` for JavaScript / TypeScript / CoffeeScript code
* `img` for images
* `css` for CSS / SASS / SCSS files

For a plugin called `foo` Inside the `foo/js` folder we typically use a file called `fooPlugin.ts` to define the plugin. This is the file which creates an AngularJS module and defines any associated factories, services, directives, filters, routes, etc.

Each controller we typically put into a file; usually using a lowercase version of the controller name (usually omitting the 'Controller' suffix since other than the `fooPlugin.ts` file most of the source is just controllers).

For general helper functions we tend to have a file called `helpers.ts`.

## URI Templates

It is common to use URI templates to denote different views. We try follow these conventions...

For a given entity or resource `Foo` consider using these URI templates:

  * `/foo` for the top level view of all the foos to view/search `foo`s
  * `/foo/edit` the edit page for `foo`s if that makes sense
  * `/foo/id/:id` the URI template of a single `foo` looking up by uniqueID
  * `/foo/idx/:index` the URI template of a single `foo` looking up by index. So `/foo/idx/0` could redirect to `/foo/id/abc` to show the first in a collection

Having the extra level of indirection between `/foo` and the id of a `foo` item; lets us have other ways to navigate the foo collection; by name/location/country or whatever.

This avoids us having `/foo` and `/foos` top level paths and having to figure out a nice URI for plural of foo and makes it easier to group all `foo` URIs by `path.startsWith("/foo")`
