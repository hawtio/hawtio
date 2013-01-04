module.exports = function (grunt) {

    grunt.initConfig({
        lint:{
            files:['grunt.js', 'main.js']
        },
        reload: {
            port: 10000,
            // test targets
            iframeTest: {
                port: 7001,
                iframe: {
                   target: 'http://localhost:9999'
                }
            },
            liveReloadTest: {
                // test at any URL with LR extension enabled
                port: 35729, // LR default
                liveReload: {
                    apply_css_live: true,
                    apply_images_live: true
                }
            },
            proxyOnlyTest: {
                port: 9001,
                proxy: {
                    // include file manually
                    // see http://localhost:9001/included.html
                    includeReloadScript: false
                }
            },
            serverProxyTest: {
                // default 8001 -> server.port 9999
                proxy: {}
            }
        },
        server:{
            port:9999
        },
        trigger: {
            watchFile: 'trigger.html'
        },
        watch:{
            files:['<config:lint.files>', '*.html', 'style.css'],
            tasks:'lint reload'
        }
    });

    // Load local tasks.
    grunt.loadTasks('../tasks');
    grunt.loadTasks('../test/tasks');

    grunt.registerTask('default', 'server reload watch');
    grunt.registerTask('liveReload', 'server reload:liveReloadTest watch');
    grunt.registerTask('proxyOnly', 'server reload:proxyOnlyTest watch');
    grunt.registerTask('serverProxy', 'server reload:serverProxyTest watch');
    grunt.registerTask('iframe', 'server reload:iframeTest watch');

};
