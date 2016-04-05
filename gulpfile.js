"use strict";
var path             = require( "path" ),
    gulp             = require( "gulp" ),
    excludeGitignore = require( "gulp-exclude-gitignore" ),
    mocha            = require( "gulp-mocha" ),
    istanbul         = require( "gulp-istanbul" ),
    coveralls        = require( "gulp-coveralls" ),
    plumber          = require( "gulp-plumber" ),
    nsp              = require( "gulp-nsp" );

/** Security check */
gulp.task( "nsp", cb => nsp( { package : path.resolve( "package.json" ) }, cb ) );

/** Code coverage */
gulp.task( "pre-test", () => gulp.src( ["./index.js"] )
                                                                  .pipe( excludeGitignore() )
                                                                  .pipe( istanbul( { includeUntested : true } ) )
                                 .pipe( istanbul.hookRequire() ) );

/** Tests */
gulp.task( "test", ["pre-test"], cb => {

    var mochaErr;

    gulp.src( "./tests.js" )
        .pipe( plumber() )
        .pipe( mocha( { reporter : "spec" } ) )
        .on( "error", err => { mochaErr = err; } )
        .pipe( istanbul.writeReports() )
        .on( "end", () => { cb( mochaErr ) } );

} );

/** Report */
gulp.task( "report", cb => gulp.src( "./coverage/**/lcov.info" ).pipe( coveralls() ) );
