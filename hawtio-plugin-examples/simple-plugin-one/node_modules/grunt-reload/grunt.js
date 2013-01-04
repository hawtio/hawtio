'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        test:{
            files:['test/**/*.js']
        },
        lint:{
            files:['grunt.js', 'tasks/**/*.js', 'test/**/*.js']
        },
        qunit:{
            all:['http://localhost:8000/test/qunit.html']
        },
        reload: {
            proxy: {}
        },
        server:{
            port:8000
        },
        trigger: {
            watchFile: 'test/trigger.html'
        },
        watch:{
            default: {
                files:['<config:lint.files>'],
                tasks:'lint reload'
            },
            triggerTest: {
                files:['test/trigger.html'],
                tasks:'reload trigger'
            }
        },
        jshint:{
            options:{
                curly:true,
                eqeqeq:true,
                immed:true,
                latedef:true,
                newcap:true,
                noarg:true,
                sub:true,
                undef:true,
                boss:true,
                eqnull:true,
                node:true,
                es5:true
            },
            globals:{
                WebSocket:true
            }
        }
    });

    // Load local tasks.
    grunt.loadTasks('tasks');
    grunt.loadTasks('test/tasks');

    grunt.registerTask('default', 'server reload watch:default');
    grunt.registerTask('triggerTest', 'server reload watch:triggerTest');

};
