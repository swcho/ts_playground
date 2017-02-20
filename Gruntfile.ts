
import * as webpack from 'webpack';

module.exports = (grunt: IGrunt) => {

    require('./tasks/build')(grunt);
    
    grunt.loadNpmTasks('grunt-webpack');

    grunt.registerTask('test', 'Log some stuff.', function () {
        grunt.log.write('Logging some stuff...').ok('ok');
    });

    const webpackConfig = require("./webpack.config.js");
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
			"build-dev": {
				devtool: "sourcemap",
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
		watch: {
			app: {
				files: ["app/**/*", "web_modules/**/*"],
				tasks: ["webpack:build-dev"],
				options: {
					spawn: false,
				}
			}
		}
    });

    grunt.registerTask('default', 'Log some stuff.', function () {
        this.requires('test');
        grunt.log.write('Logging some stuff...').ok('ok');
    });
}