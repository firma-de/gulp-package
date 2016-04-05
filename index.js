"use strict";

var tar          = require( "gulp-tar" ),
    gzip         = require( "gulp-gzip" ),
    path         = require( "path" ),
    fs           = require( "fs" ),
    gutil        = require( "gulp-util" ),
    combine      = require( "stream-combiner" ),
    through      = require( "through2" ),
    beautify     = require( "js-beautify" ),
    extend       = require( "deep-extend" ),
    detectIndent = require( "detect-indent" ),
    file         = require( "gulp-file" );

module.exports = function( options ) {

    /** Set default options */
    if ( !options ) { options = {}; }

    /**
     * We need the following options provided
     */
    const revision = options["revision"] || "snapshot",
          branch   = options["branch"] || "branchless";

    /**
     * `package.json` manipulation
     */
    const pkgFilePath = path.join( process.cwd(), "package.json" ),
          pkg         = extend( require( pkgFilePath ), { build : revision } ),
          indent      = detectIndent( fs.readFileSync( pkgFilePath, "utf-8" ) ),
          modifiedPkg = JSON.stringify( pkg, null, indent["indent"] ),
          filename    = pkg["name"].split("/")[1] || pkg["name"];

    /**
     * JS Beautifier options
     */
    const beautifyOptions = {
        indent_size : indent.amount || 2,
        indent_char : indent.type === "tab" ? "\t" : " "
    };

    /**
     * Check if we have more than one package.json file provided
     */
    var checkMultiplePackageFiles = (function() {
        var pkgFileFound = false;
        return function( path ) {
            if ( path === "package.json" ) {
                if ( pkgFileFound === false ) {
                    pkgFileFound = true;
                } else {
                    return false;
                }
            }
            return true;
        }
    })();

    /**
     * Create the stream
     */
    const fixRelative = through.obj( function( file, enc, callback ) {
        if ( !file.isDirectory() ) {
            file.path = file.relative.replace( /^\.\.\//, "" );
            if ( checkMultiplePackageFiles( file.path ) === false ) {
                var error = new gutil.PluginError(
                    "@firma-de/gulp-package", "More than one `package.json` files found"
                );
                this.emit( "error", error );
            } else {
                this.push( file );
            }
        }
        callback();
    } );

    /**
     * Return a stream
     */
    return combine(
        file( pkgFilePath, beautify( modifiedPkg, beautifyOptions ) ),
        fixRelative,
        tar( filename + "-" + branch + "-" + revision + ".tar" ),
        gzip()
    );

};

