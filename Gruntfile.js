module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            njk: {
                files: ['templates/**/*.njk'],
                task: ['nunjucks'],
                options: {
                    spawn: false,
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
        }
    });

    // Load the plugin that provides the "uglify" task.
    require('load-grunt-tasks')(grunt, {
        scope: 'devDependencies'
    });

    // Default task(s).
    grunt.registerTask('default', ['nunjucks', 'prettify']);

};