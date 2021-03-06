/*global module */

var istanbul = require("browserify-istanbul");

var olexpcss = [
    "src/css/explorer.css",
    "src/css/control.css",
    "src/css/item.css",
    "src/css/measure.css",
    "src/css/menu.css",
    "src/css/ol.css",
    "src/css/olexp.ol3.css",
    "src/css/olexp.w2ui.css"
];

var olexpjs = [
    "src/js/explorer.js",
    "src/js/event.js",
    "src/js/control.js",
    "src/js/item.js",
    "src/js/manager.js",
    "src/js/measure.js",
    "src/js/menu.js",
    "src/js/ol.js",
    "src/js/selection.js",
    "src/js/util.js"
];

module.exports = function (grunt) {

    var pkg = grunt.file.readJSON("package.json");
    var banner = "/* " + pkg.name + " " + pkg.version + " (c) " + pkg.author.name + " <" + pkg.author.email + ">" + " */\n";

    grunt.initConfig({

        pkg: pkg,

        browserify: {
            options: {
                browserifyOptions: {
                    debug: true
                },
                postBundleCB: function (err, buffer, next) {
                    var code = grunt.template.process(buffer.toString(), { data: grunt.file.readJSON("package.json") });
                    next(err, code);
                }
            },
            coverage: {
                files: {
                    "instrumented-code/olexp.js": olexpjs
                },
                options: {
                    transform: [istanbul]
                }
            }
        },
 
        clean: {
            api: [
                     "docs/api/*"
                 ],
            olexp: [
                       "dist/*.js",
                       "dist/*.css"
                   ],
            test: [
                "coverage",
                "instrumented-code"
            ]
        },

        concat: {
            css: {
                dest: "dist/olexp.css",
                options: {
                    banner: banner
                },
                src: olexpcss
            },
            js: {
                dest: "dist/olexp.js",
                options: {
                    banner: banner
                },
                src: olexpjs
            },
            "css-sa": {
                dest: "dist/olexp.sa.min.css",
                options: {
                    banner: banner
                },
                src: [
                         "libs/ol3/ol.css",
                         "libs/w2ui/w2ui.min.css",
                         "dist/olexp.min.css"
                     ]
            },
            "js-sa": {
                dest: "dist/olexp.sa.min.js",
                src: [
                         "libs/jquery/jquery.min.js",
                         "libs/ol3/ol.js",
                         "libs/w2ui/w2ui.min.js",
                         "dist/olexp.min.js"
                     ]
            }
        },

        copy: {
            main: {
                files: [
                    {
                        dest: "docs/api/docs/web/img/",
                        expand: true,
                        filter: "isFile",
                        flatten: true,
                        src: ["docs/web/img/*"]
                    }
                ]
            }
        },

        csslint: {
            olexp: {
                options: {
                    "overqualified-elements": false
                },
                src: [
                    "src/css/*.css",
                    "src/css/!*.min.css"
                ]
            }
        },

        cssmin: {
            dist: {
                cwd: "dist/",
                dest: "dist/",
                expand: true,
                ext: ".min.css",
                src: [
                    "*.css",
                    "!*.min.css"
                ]
            }
        },

        "gh-pages": {
            src: ["dist/**",
                  "docs/**",
                  "libs/**",
                  "index.html"]
        },

        gitadd: {
            dist: {
                files: {
                    src: ["dist/*"]
                }
            }
        },
  
        gitcommit: {
            dist: {
                options: {
                    message: "Add new dist files for release " + pkg.version
                },
                files: {
                    src: ["dist/*"]
                }
            }
        },

        jsdoc : {
            dist : {
                options: {
                    configure: "conf.json",
                    destination: "docs/api",
                    template: "node_modules/ink-docstrap/template"
                }
            }
        },

        jshint: {
            dist: {
                src: [
                    "src/js/*.js",
                    "!src/js/*.min.js"
                ]
            }
        },

        mocha: {
            options: {
                coverage: {
                    jsonReport: "coverage",
                    coberturaReport: "coverage",
                    lcovReport: "coverage",
                    cloverReport: "coverage"
                },
                reporter: "Spec",
                run: true,
                timeout: 60000
            },
            test: {
                src: ["test/index.html"]
            }
        },

        release: {
            options: {
                afterBump: ["default", "dist"],
                github: {
                    repo: "dpmcmlxxvi/olexp",
                    accessTokenVar: "GITHUB_ACCESS_TOKEN"
                },
            }
        },

        uglify: {
            olexp: {
                files: {
                    "dist/olexp.min.js": "dist/olexp.js"
                },
                options: {
                    banner: banner
                }
            }
        },

    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-csslint");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-gh-pages");
    grunt.loadNpmTasks("grunt-git");
    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-mocha-phantom-istanbul");
    grunt.loadNpmTasks("grunt-release");

    grunt.registerTask("dist", ["gitadd:dist", "gitcommit:dist"]);
    grunt.registerTask("lint", ["csslint", "jshint"]);
    grunt.registerTask("minify", ["cssmin", "uglify"]);
    grunt.registerTask("concat-core", ["concat:css", "concat:js"]);
    grunt.registerTask("concat-sa", ["concat:css-sa", "concat:js-sa"]);
    grunt.registerTask("default", ["clean", "lint", "concat-core", "minify", "concat-sa", "jsdoc", "copy"]);
    grunt.registerTask("test", ["clean:test", "browserify:coverage", "mocha"]);
    grunt.registerTask("web", ["gh-pages"]);

};
