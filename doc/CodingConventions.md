# Code Conventions

While we don't want to be too anal about coding styles, we are trying to adopt conventions to help make things easier to find, name, navigate and use.

Here's a few of them we've found over time...

## URI templates

Its common to use URI templates to denote different views. We try follow these conventions...

For a given entity or resource Foo consider using these URI templates

  * /foo for the top level view of all the foos to view/search foos
  * /foo/edit the edit page for foos if that makes sense
  * /foo/id/:id the URI template of a single foo looking up by uniqueID
  * /foo/idx/:index the URI template of a single foo looking up by index. So /foo/idx/0 could redirect to /foo/id/abc to show the first in a collection

Having the extra level of indirection between /foo and the id of a foo item; lets us have other ways to navigate the foo collection; by name/location/country or whatever.

This avoids us having /foo and /foos top level paths & having to figure out a nice URI for plural of foo and makes it easier to group all foo URIs by path.startsWith("/foo")
