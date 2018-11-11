module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        express: {
            all: {
                options: {
                    bases: ['C:\\Users\\Gebruiker\\WebstormProjects\\differential'],
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
                files: ['templates/**/*.njk'],
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
        parallel:{
            web: {
                options:{
                    stream: true
                },
                tasks: [{
                    grunt: true,
                    args: ['watch:css']
                },{
                    grunt: true,
                    args: ['watch:js']
                },{
                    grunt: true,
                    args: ['watch:njk']
                }]
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
        }
    });

    // Load the plugin that provides the "uglify" task.
    require('load-grunt-tasks')(grunt, {
        scope: 'devDependencies'
    });

    // Default task(s).
    grunt.registerTask('compile', ['nunjucks', 'prettify']);
    grunt.registerTask('web', ['compile', 'express', 'open', 'watch']);
    grunt.registerTask('default', 'web')

};