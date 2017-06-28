
import * as path from 'path';

import * as webpack from 'webpack';

module.exports = (grunt: IGrunt) => {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-spawn-process');

    const PATH_OUT = path.join(__dirname, '../../out');
    const PATH_OUT_CLIENT = path.join(PATH_OUT, 'client');
    const PATH_OUT_SERVER = path.join(PATH_OUT, 'server');

    const PATH_DIST = path.join(__dirname, '../../dist');

    const webpackConfig = require("./webpack.config");

    grunt.initConfig({
        clean: {
            client: PATH_OUT_CLIENT,
            server: PATH_OUT_SERVER,
        },
        webpack: {
            options: webpackConfig,
            build: {
                output: {
                    publicPath: "//swcho.github.io/ts_boilerplate/dist/client/assets/",
                },
                plugins: webpackConfig.plugins.concat(
                    new webpack.DefinePlugin({
                        "process.env": {
                            "NODE_ENV": JSON.stringify("production")
                        }
                    }),
                    new webpack.optimize.DedupePlugin(),
                    new webpack.optimize.UglifyJsPlugin()
                )
            },
            watch: {
                output: {
                    publicPath: "//localhost:3000/assets/",
                },
                devtool: "sourcemap",
                watch: true
            }
        },
        "webpack-dev-server": {
            options: {
                webpack: webpackConfig,
                publicPath: "/" + webpackConfig.output.publicPath
            },
            start: {
                keepAlive: true,
                webpack: {
                    devtool: "eval",
                }
            }
        },
        ts: {
            server: {
                tsconfig: 'src/server/tsconfig.json'
            }
        },
        copy: {
            client: {
                expand: true,
                cwd: PATH_OUT,
                src: 'client/**',
                dest: PATH_DIST
            }
        },
        run_server: {
            default: {
                path: PATH_OUT_SERVER
            }
        },
        spawnProcess: {
            server: {
                spawnOptions: {
                    cwd: path.join(__dirname, '../../out/server'),
                    env: {
                        'USE_BROWSER_SYNC': 'true'
                    },
                },
                cmd: process.env['NODE'],
                args: ['app.js']
            }
        }
    });

    grunt.registerTask('serve', ['clean', 'ts:server', 'spawnProcess:server', 'webpack:watch']);
    grunt.registerTask('build', ['clean:client', 'webpack:build', 'ts:server']);
    grunt.registerTask('dist', ['build', 'copy:client']);
    grunt.registerTask('default', ['build']);
}
