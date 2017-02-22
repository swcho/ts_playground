import * as webpack from 'webpack';
import * as path from 'path';
import {ConfigPlugin} from './plugins/config-plugin';

const BASE_SRC = './src'

module.exports = {
    cache: true,
    entry: {
        main: BASE_SRC + "/client/apps/main/app.ts",
    },
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "dist/",
        filename: "[name].js",
        chunkFilename: "[chunkhash].js"
    },
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: 'html-loader',
                query: {
                    minimize: true
                }
            },

            // required to write "require('./style.css')"
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },

            // required for bootstrap icons
            {
                test: /\.woff$/,
                loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff"
            },
            {
                test: /\.ttf$/,
                loader: "file-loader?prefix=font/"
            },
            {
                test: /\.eot$/,
                loader: "file-loader?prefix=font/"
            },
            {
                test: /\.svg$/,
                loader: "file-loader?prefix=font/"
            },

            // required for react jsx
            {
                test: /\.js$/,
                loader: "jsx-loader"
            },
            {
                test: /\.jsx$/,
                loader: "jsx-loader?insertPragma=React.DOM"
            },

            // required for TypeScript
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    configFileName: BASE_SRC + '/client/tsconfig.json'
                }
            },
        ]
    },
    resolve: {
        alias: {
            // Bind version of jquery
            jquery: "jquery-2.0.3",

            // Bind version of jquery-ui
            "jquery-ui": "jquery-ui-1.10.3",

            // jquery-ui doesn't contain a index file
            // bind module to the complete module
            "jquery-ui-1.10.3$": "jquery-ui-1.10.3/ui/jquery-ui.js",
        },
    },
    resolveLoader: {
        alias: {
            'config-loader': path.join(__dirname, "./loaders/config-loader"),
            'htmlout-loader': path.join(__dirname, "./loaders/htmlout-loader")
        }
        // fallback: [
        //     path.resolve(__dirname, 'loaders'),
        //     path.join(process.cwd(), 'node_modules')
        // ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            // Automtically detect jQuery and $ as free var in modules
            // and inject the jquery library
            // This is required by many jquery plugins
            jQuery: "jquery",
            $: "jquery"
        }),
        new ConfigPlugin()
    ]
};
