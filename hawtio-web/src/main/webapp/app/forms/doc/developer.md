### Forms

This plugin provides an easy way, given a [JSON Schema](http://json-schema.org/) model of generating a form with 2 way binding to some JSON data.

For an example of it in action, see the [test.html](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/forms/html/test.html) or run it via [http://localhost:8080/hawtio/#/forms/test](http://localhost:8080/hawtio/#/forms/test).

## Customizing the UI with tabs

The easiest way to customise the generated form is to specify which order you want the fields to appear; or to move different fields onto different tabs using the **tabs** object on a json schema type.
e.g.

        tabs: {
          'Tab One': ['key', 'value'],
          'Tab Two': ['*'],
          'Tab Three': ['booleanArg'],
					'Tab Four': ['foo\\..*']
        }

You can use "*" to refer to all the other properties not explicitly configured.

In addition you can use regular expressions to bind properties to a particular tab (e.g. so we match foo.* nested properties to Tab Four above). 

## Hiding fields

You can add a **hidden** flag on a property in a JSON schema to hide it from the auto-generated forms. Or you can set its type to be **hidden**.

e.g.

    properties: {
      foo: {
        type: "string",
        label: "My Foo Thingy"
     },
     bar: {
        type: "string",
        hidden: true
     }
   }

in the above, the _bar_ property will be hidden from the generated form

## Customizing the labels

If you wish to specify a custom label for a property (as by default it will just humanize the id of the property), you can just specify the 'label' property inside the JSON Schema as follows:


    properties: {
      foo: {
        type: "string",
        label: "My Foo Thingy"
     }
   }

The **label** is not a JSON Schema property; but an extension like the **tabs** property above.

### Ignoring prefix of deeply nested properties

If you use nested properties, the labels may include an unnecessary prefix if you use sub-tabs to show related nested properties.

To avoid this add a flag called **ignorePrefixInLabel** to the type which contains the **properties** you wish to ignore the prefixes of.

e.g.

    var myType = {
      "type" : "object",
      "properties" : {
        "foo" : {
          "properties" : {
            "value" : {
              "type" : "string"
            }
          }
        },
        "bar" : {
         ...
        }
      },
      ignorePrefixInLabel: true
    }

In the aboe the label for **foo.value** would jsut show _value_ rather than _foo value_ as the label.

## Using custom controls

To use a custom control use the **formTemplate** entry on a property to define the AngularJS partial to be used to render the form control. This lets you use any AngularJS directive or widget.

For example if you search for **formTemplate** in the [code generated Camel json schema file](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/camel/js/camelModel.js#L120) you will see how the **description** property uses a _textarea_