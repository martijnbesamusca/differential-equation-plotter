const path = require('path');
require('json5/lib/register');

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        /** Test localhost **/
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: 'dist',
                    hostname: 'localhost',
                    // protocol: 'https',
                    livereload: true,
                    open: true
                }
            }
        },

        /** Whatch **/
        watch: {
            css: {
                files: ['sass/**/*.scss', 'sass/**/*.sass'],
                tasks: ['compile-sass'],
                options: {
                    livereload: true
                }
            },
            ts: {
                files: ['ts/**/*.ts'],
                tasks: ['compile-ts'],
                options: {
                    livereload: true
                }
            },
            njk: {
                files: ['templates/**/*.njk', 'pages/**/*.njk', 'cfg/data.json5'],
                tasks: ['compile-njk'],
                options: {
                    livereload: true
                }
            },
            gruntfile: {
                files: 'Gruntfile.js',
                options: {
                    reload: true
                }
            }
        },

        /** Render nunjucks files to html **/
        json5_to_json: {
            options: {
            },
            target: {
                files: {
                    'cfg/data.json': 'cfg/data.json5'
                }
            },
        },

        nunjucks: {
            options: {
                data: require('./cfg/data.json5'),
                paths: ['templates', 'pages']
            },
            render: {
                files: [{
                    expand: true,
                    cwd: 'pages',
                    src: '**/*.njk',
                    dest: 'dist',
                    ext: '.html'
                }]
            }
        },

        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'sass',
                    src: ['*.scss', '*.sass'],
                    dest: 'dist/css',
                    ext: '.css'
                }]
            }
        },

        ts:{
            default : {
                tsconfig: 'cfg/tsconfig.json',
                options: {
                    verbose: true
                }
            }
        },

        prettify: {
            options: {
                config: 'cfg/.prettifyrc'
            },
            all: {
                expand: true,
                cwd: 'dist/',
                ext: '.html',
                src: ['*.html'],
                dest: 'dist/'
            }
        },

        autoprefixer: {
            options: {
                map: true
                // Task-specific options go here.
            },
            dest: {
                expand: true,
                cwd: 'dist/css',
                ext: '.css',
                src: ['*.css'],
                dest: 'dist/css'
            },
        },

        mathjax_node_page: {
            options: {
                // Task-specific options go here.
            },
            files: {
                expand: true,
                cwd: 'dist/',
                ext: '.html',
                src: ['*.html'],
                dest: 'dist/'
            },
        },

        cachebreaker: {
            dev: {
                options: {
                    match: [{
                        'particles.js': 'js/particles.js',
                        'events.js': 'js/events.js',
                        'main.js': 'js/main.js',
                        'util.js': 'js/util.js',
                        'style.css': 'css/style.css'
                    }],
                    replacement: 'md5',
                    src: {path: 'dist'}
                },
                files: {
                    src: ['index.html']
                }
            }
        },
        clean:{
            dist: ['dist'],
            css: ['dist/css/**/*.css', 'dist/css/**/*.css.map'],
            js: ['dist/js/**/*.js', 'dist/js/**/*.js.map'],
            html: ['dist/**/*.html']
        }
    });

    // Load the plugin that provides the "uglify" task.
    require('load-grunt-tasks')(grunt, {
        scope: 'devDependencies'
    });

    // Default task(s).
    grunt.registerTask('compile-njk', ['clean:html', 'nunjucks', 'mathjax_node_page', 'prettify']);
    grunt.registerTask('compile-ts', ['clean:js', 'ts']);
    grunt.registerTask('compile-sass', ['clean:css', 'sass', 'autoprefixer']);
    grunt.registerTask('compile', ['compile-ts', 'compile-sass', 'compile-njk']);
    grunt.registerTask('test', ['compile', 'connect', 'watch']);
    grunt.registerTask('default', 'compile');
};