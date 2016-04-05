# Gulp Package

[![npm version](https://img.shields.io/npm/v/@firma-de/gulp-package.svg)](https://www.npmjs.com/package/@firma-de/gulp-package)
[![build status](https://img.shields.io/circleci/project/firma-de/gulp-package/master.svg)](https://circleci.com/gh/firma-de/gulp-package)
[![dependencies](https://img.shields.io/david/firma-de/gulp-package.svg)](https://david-dm.org/firma-de/gulp-package)
[![coverage](https://img.shields.io/coveralls/firma-de/gulp-package/master.svg)](https://coveralls.io/github/firma-de/gulp-package)

Gulp module for packaging a NodeJS project for deployment

## Description

Will generate a `tar.gz` package of the project with included 
`package.json`. It adds to the `package.json` a `build` property that 
will be the `revision` option if provided.

This gulp plugin is opinionated and is used across our projects.

## Installation

```
$ npm install @firma-de/gulp-package
```

## Usage

Basic usage :

```
const pack = require("@firma-de/gulp-package");

return gulp
    .src( [
        "./.build/**/*",
        "./config/**"
    ], { base : "./.build" } )
    .pipe( pack( {
        revision : `${your_git_revision}`,
        branch : `${your_git_branch}`
    } ) )
    .pipe( gulp.dest( "./package" ) )
```

With this configuration options it will create a `tar.gz` file that has
as a root `./build` folder and inside it will copy `./config` and the
`package.json` of the project.

It will add to the package.json `revision` property from the 
configuration and it will name the file `pkgName-gitBranch-gitRev.tar.gz` 

## Options

### `revision`

The revision number that will be included in `package.json` and in the
name of the final file.

Usually this can be env variable from your build, e.g. :

```
{ revision: process.env["CIRCLE_SHA1"] }
```

Value : `String`
  
Default Value : `snapshot`  

### `branch`

Branch of the package. It's used for the name of the package file.

Usually this can be env variable from your build, e.g. :

```
{ branch: process.env["CIRCLE_BRANCH"] }
```

Value : `String`
  
Default Value : `branchless`

## License

MIT
