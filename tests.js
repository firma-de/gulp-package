"use strict";

var gulp        = require( "gulp" ),
    should      = require( "should" ),
    temp        = require( "temp" ),
    path        = require( "path" ),
    fs          = require( "fs" ),
    through     = require( "through2" ),
    plumber     = require( "gulp-plumber" ),
    decompress  = require( "gulp-decompress" ),
    assert      = require( "yeoman-assert" ),
    gulpPackage = require( "./index.js" );

describe( "module requirements", function() {

    it( "should export a function", () => {
        gulpPackage.should.be.Function();
    } );

    it( "should not throw errors if we provide no options", () => {
        should.doesNotThrow( function() { gulpPackage(); } );
    } );

} );

describe( "module functionality", function() {

    it( "should execute with proper source files", function( done ) {

        gulp.src( ["./fixtures/**/*"] )
            .pipe( gulpPackage() )
            .on( "end", () => done() );

    } );

    it( "should create a proper tar.gz file", function( done ) {

        var tempPath = temp.mkdirSync( "gulp-package-test" );

        gulp.src( ["./fixtures/**/*"] )
            .pipe( gulpPackage() )
            .pipe( gulp.dest( tempPath ) )
            .on( "end", () => {
                assert.file(
                    path.join(
                        tempPath,
                        "gulp-package-branchless-snapshot.tar.gz" )
                );
                temp.cleanupSync();
                done();
            } );

    } );

    it( "should create a proper filename based on branch and revision", function( done ) {

        var tempPath = temp.mkdirSync( "gulp-package-test" );

        gulp.src( ["./fixtures/**/*"] )
            .pipe( gulpPackage( { branch : "a", revision : "b" } ) )
            .pipe( gulp.dest( tempPath ) )
            .on( "end", () => {
                assert.file( path.join( tempPath, "gulp-package-a-b.tar.gz" ) );
                temp.cleanupSync();
                done();
            } );

    } );

    it( "should modify `package.json` inside the archive", function( done ) {

        var tempPath = temp.mkdirSync( "gulp-package-test" );

        gulp.src( ["./fixtures/**/*"] )
            .pipe( gulpPackage( { branch : "a", revision : "foo" } ) )
            .pipe( gulp.dest( tempPath ) )
            .on( "end", () => {

                gulp.src( path.join( tempPath, "gulp-package-a-foo.tar.gz" ) )
                    .pipe( decompress() )
                    .pipe( through.obj( function( file, enc, callback ) {

                        if ( file.relative === "package.json" ) {

                            const pkg = JSON.parse( file.contents.toString( 'utf8' ) );
                            pkg.should.have.property( "build", "foo" );
                            temp.cleanupSync();
                            done();
                            callback();

                        }

                    } ) );

            } );

    } );

    it( "should keep the structure provided in the config", function( done ) {

        var tempPath = temp.mkdirSync( "gulp-package-test" ),
            fixtures = {
                "package.json" : true,
                "build" : true,
                "inside-build/inside-build" : true,
                "config/default" : true,
                "config/inside-config/inside-config" : true
            };

        gulp.src( [
                "./fixtures/build/**/*",
                "./fixtures/config/**/*"
            ], { base : "./fixtures/build" } )
            .pipe( gulpPackage( { branch : "a", revision : "bar" } ) )
            .pipe( gulp.dest( tempPath ) )
            .on( "end", () => {

                gulp.src( path.join( tempPath, "gulp-package-a-bar.tar.gz" ) )
                    .pipe( decompress() )
                    .pipe( through.obj( function( file, enc, callback ) {
                        fixtures.should.have.property( file.relative );
                        delete fixtures[file.relative];
                        callback();
                    }, function() {
                        Object.keys( fixtures )
                              .should
                              .have
                              .length( 0 );
                        temp.cleanupSync();
                        done();
                    } ) );

            } );

    } );

    it( "should keep the structure even with no `base` option", function( done ) {

        var tempPath = temp.mkdirSync( "gulp-package-test" ),
            fixtures = {
                "package.json" : true,
                "build" : true,
                "inside-build/inside-build" : true,
                "default" : true,
                "inside-config/inside-config" : true
            };

        gulp.src( [
                "./fixtures/build/**/*",
                "./fixtures/config/**/*"
            ] )
            .pipe( gulpPackage( { branch : "a", revision : "bar" } ) )
            .pipe( gulp.dest( tempPath ) )
            .on( "end", () => {

                gulp.src( path.join( tempPath, "gulp-package-a-bar.tar.gz" ) )
                    .pipe( decompress() )
                    .pipe( through.obj( function( file, enc, callback ) {
                        fixtures.should.have.property( file.relative );
                        delete fixtures[file.relative];
                        callback();
                    }, function() {
                        Object.keys( fixtures )
                              .should
                              .have
                              .length( 0 );
                        temp.cleanupSync();
                        done();
                    } ) );

            } );

    } );

    it( "should complain if we have more than one `package.json`", function( done ) {

        gulp.src( [
                "./fixtures/build/**/*",
                "./fixtures/config/**/*",
                "./package.json"
            ], { base : "./fixtures" } )
            .pipe( gulpPackage( { branch : "a", revision : "bar" } ) )
            .on( "error", () => { done(); } );

    } );

} );