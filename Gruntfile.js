const path = require('path');
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        express: {
            all: {
                options: {
                    bases: path.resolve(__dirname),
                    port: 8080,
                    hostname: '0.0.0.0',
                    livereload: true
                }
            }
        },

        watch: {
            css: {
                files: ['css/**/*.css'],
                options: {
                }
            },
            js: {
                files: ['js/**/*.js'],
                options: {
                }
            },
            njk: {
                files: ['templates/**/*.njk', 'data.json'],
                tasks: ['compile'],
                options: {
                    livereload: true
                }
            },
            gruntfile: {
                files: "Gruntfile.js",
                options: {
                    reload: true
                }
            }
        },

        nunjucks: {
            options: {
                data: grunt.file.readJSON('data.json'),
                paths: 'templates'
            },
            render: {
                files: [{
                    expand: true,
                    cwd: 'templates',
                    src: [
                        '**/index.njk'
                    ],
                    dest: '',
                    ext: '.html'
                }]
            }
        },
        prettify: {
            options: {
                config: '.prettifyrc'
            },
            one: {
                src: 'index.html',
                dest: 'index.html'
            }
        },
        open: {
            all: {
                path: 'http://localhost:8080/index.html'
            }
        },
        cachebreaker: {
            dev: {
                options: {
                    match: [{
                        'particles.js':     'js/particles.js',
                        'events.js':        'js/events.js',
                        'main.js':          'js/main.js',
                        'util.js':          'js/util.js',
                        'style.css':        'css/style.css'
                    }],
                    replacement: 'md5'
                },
                files: {
                    src: ['index.html']
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    require('load-grunt-tasks')(grunt, {
        scope: 'devDependencies'
    });

    // Default task(s).
    grunt.registerTask('compile', ['nunjucks', 'prettify', 'cachebreaker']);
    grunt.registerTask('web', ['compile', 'express', 'open', 'watch']);
    grunt.registerTask('default', 'web')

};