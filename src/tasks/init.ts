
import * as path from 'path';

import * as webpack from 'webpack';

module.exports = (grunt: IGrunt) => {

    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-spawn-process');

    const PATH_OUT = path.join(__dirname, '../../out');
    const PATH_OUT_SERVER = path.join(PATH_OUT, 'server');

    const webpackConfig = require("./webpack.config");

    grunt.initConfig({
        webpack: {
            options: webpackConfig,
            build: {
                plugins: webpackConfig.plugins.concat(
                    new webpack.DefinePlugin({
                        "process.env": {
                            // This has effect on the react lib size
                            "NODE_ENV": JSON.stringify("production")
                        }
                    }),
                    new webpack.optimize.DedupePlugin(),
                    new webpack.optimize.UglifyJsPlugin()
                )
            },
            "watch": {
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
                cmd: 'node',
                args: ['app.js']
            }
        }
    });

    console.log('server path: ', path.join(__dirname, '../../out/server'));

    grunt.registerTask('serve', ['ts:server', 'spawnProcess:server', 'webpack:watch']);
    grunt.registerTask('default', ['webpack:build-dev', 'ts:server']);
}
