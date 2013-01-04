# grunt-type [![Build Status](https://secure.travis-ci.org/alvivi/grunt-type.png)](http://travis-ci.org/alvivi/grunt-type)

> Compile TypeScipt source code

### Configuration

Inside your `grunt.js` file add a section named `type`. This section specifies
the source files to compile and the options passed to
[TypeScript](http://www.typescriptlang.org/) compiler.

#### Parameters

##### files ```object```

This defines what files this task will compile and should contain key:value
pairs.

The key (destination) can be an unique path (supports
[grunt.template](https://github.com/gruntjs/grunt/blob/master/docs/api_template.md))
and the value (source) should be a filepath or an array of filepaths (supports
[minimatch](https://github.com/isaacs/minimatch)).

When compiling to a directory you **must** add a trailing slash to the
destination.

##### options ```object```

This controls how this task operates and should contain key:value pairs, see
options below.

#### Options

##### basePath ```string```

This option adjusts the folder structure when compiled to the destination
directory. When not explicitly set, best effort is made to locate the basePath
by comparing all source filepaths left to right for a common pattern.

##### flatten ```boolean```

This option performs a flat compilation that dumps all the files into the root
of the destination directory, overwriting files if they exist.


##### comments ```boolean```

Forces the compiler to emit comments to output.

##### const ```boolean```

Propagate constants to emitted code.

##### minw ```boolean```

Forces the compiler to minimize whitespaces.

##### module ```string```

Specify module code generation. Valid values are `commonjs` (default) or `amd`.

##### noerroronwith ```boolean```

Allow `with` statements in TypeScript source code.

##### nolib ```boolean```

Do not include a default `lib.d.ts` with global declarations.

##### nooptimizemodules ```boolean```

Do not optimize module codegen.

##### noresolve ```boolean```

Skip resolution and preprocessing.

##### style ```string```

Select style checking options (examples ```'requireSemi:off'```
```'eqeqeq;bitwise:off'```). Valid checkig options are: `bitwise`,
`blockInCompoundStmt`, `eqeqeq`, `forin`, `emptyBlocks`, `newMustBeUsed`,
`requireSemi`, `assignmentInCond`, `eqnull`, `evalOK`, `innerScopeDeclEscape`,
`funcInLoop`, `reDeclareLocal`, `literalSubscript` and `implicitAny`. This
options are similar to [JsHint](http://www.jshint.com/docs/) options.

##### reference ```object```

Add ambient references to the compilation. The value should be a filepath or
an array of filepaths (supports [minimatch](https://github.com/isaacs/minimatch)).

##### target ```string```

Specify ECMAScript target version: ```'ES3'``` (default), or ```'ES3'```.

##### tsc ```string```

Path to the `tsc` TypeScript compiler. By default, **grunt-type** uses the
compiler installed in the system or a bundled version of the compiler (
currently version ```0.8.x```).

#### Config Example

``` javascript
type: {
  compile: {
    files: {
      'path/to/simple.js': ['path/to/type1.ts'],
      'path/to/concat.js': ['path/to/type2.ts',
                            'path/to/type1.ts'],
      'path/to/many/*.js': ['path/to/**/*.ts']
    },
    options: {
      target: 'ES5'
    }
  },
  options: {
    module: 'amd',
    style: 'eqeqeq;bitwise'
  }
}
```

--

*Task submitted by [Alvaro Vilanova](https://github.com/alvivi).*
