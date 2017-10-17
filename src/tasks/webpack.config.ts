
import * as path from 'path';

import * as webpack from 'webpack';
import * as glob from 'glob';

import {ClientPlugin} from './plugins/client-plugin';

const BASE_SRC = path.resolve(__dirname + '/../../src');
const BASE_SRC_CLIENT = `${BASE_SRC}/client`;
const BASE_SRC_APPS = `${BASE_SRC_CLIENT}/apps`;

const BASE_OUT = path.resolve(__dirname + '/../../out');
const BASE_OUT_CLIENT = `${BASE_OUT}/client`;

const CONFIG_FILE_NAME = '.config.ts';
const APP_FILE_NAME = 'app.*';

const configList = glob.sync(`${BASE_SRC_APPS}/**/${CONFIG_FILE_NAME}`);

interface EntryInfo {
    pathname: string;
    entryFilePath: string;
    chunkName: string;
}

let entryInfoList = configList.map<EntryInfo>(configPath => {
    const dir = configPath.replace(`/${CONFIG_FILE_NAME}`, '');
    const pathname = dir.replace(BASE_SRC_APPS, '');
    const entryFilePath = glob.sync(`${dir}/${APP_FILE_NAME}`)[0];
    // const chunkName = pathname.replace('/', '_');
    const chunkName = pathname.replace('/', '');
    return {
        pathname,
        entryFilePath,
        chunkName
    };
});

if (process.env['ROUTE']) {
    entryInfoList = entryInfoList.filter(info => info.pathname === process.env['ROUTE']);
}

const entries = entryInfoList.reduce((ret, info) => {
    ret[info.chunkName] = info.entryFilePath;
    return ret;
}, {});

const webpackConfig: webpack.Configuration = {
    cache: true,
    entry: entries,
    output: {
        path: path.resolve(__dirname, '../client/assets'),
        publicPath: '/assets/',
        filename: '[name].[chunkhash].js',
        chunkFilename: '[chunkhash].js',
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader'
            },

            // haml
            {
                test: /\.pug$/,
                use: [{
                    loader: 'html-loader'
                }, {
                    loader: 'pug-html-loader'
                }]
            },

            // require to write markdown
            {
                test: /\.md$/,
                use: [{
                    loader: 'html-loader'
                }, {
                    loader: 'markdown-loader'
                }]
            },
            // required to write "require('./style.css')"
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader' // translates CSS into CommonJS
                    },
                ]
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader' // translates CSS into CommonJS
                    },
                    {
                        loader: 'less-loader'
                    },
                ]
            },
            {
                test: /\.s[ca]ss$/,
                use: [
                    {
                        loader: 'style-loader' // creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader' // translates CSS into CommonJS
                    },
                    {
                        loader: 'postcss-loader' // translates CSS into CommonJS
                    },
                    {
                        loader: 'sass-loader' // compiles Sass to CSS
                    },
                ]
            },
            {
                test: /\.stylus$/,
                use: [
                    {
                        loader: 'style-loader' // creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader' // translates CSS into CommonJS
                    },
                    {
                        loader: 'postcss-loader' // translates CSS into CommonJS
                    },
                    {
                        loader: 'styl-loader' // compiles Sass to CSS
                    },
                ],
            },

            // required for bootstrap icons
            {
                test: /\.woff$/,
                loader: 'url-loader?prefix=font/&limit=5000&mimetype=application/font-woff'
            },
            {
                test: /\.ttf$/,
                loader: 'file-loader?prefix=font/'
            },
            {
                test: /\.eot$/,
                loader: 'file-loader?prefix=font/'
            },
            {
                test: /\.svg$/,
                loader: 'file-loader?prefix=font/'
            },

            // images
            {
                test: /\.png$/,
                loader: 'file-loader?prefix=imgs/'
            },
            {
                test: /\.jpg$/,
                loader: 'file-loader?prefix=imgs/'
            },
            // required for react jsx
            // {
            //     test: /\.js$/,
            //     loader: "jsx-loader",
            //     enforce: 'pre',
            // },
            // {
            //     test: /\.jsx?$/,
            //     loader: "babel-loader",
            //     enforce: "pre"
            // },

            // required for TypeScript
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFileName: path.join(BASE_SRC_CLIENT, 'tsconfig.json')
                }
            },
            {
                test: /\.(glsl|frag|vert)$/,
                use: [
                    {
                        loader: 'webpack-glsl-loader',
                    },
                    // {
                    //     loader: 'glslify-loader',
                    // },
                    // {
                    //     loader: 'raw-loader',
                    // },
                ],
            },
        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, '../../node_modules'),
        ],
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.jsx'],
        alias: {
            '$lib': path.join(BASE_SRC_CLIENT, 'lib'),
            'yaml-js$': path.resolve(__dirname, '../../node_modules/yaml-js/lib/yaml.js'),
            // Bind version of jquery
            // jquery: "jquery-2.0.3",

            // Bind version of jquery-ui
            // "jquery-ui": "jquery-ui-1.10.3",

            // jquery-ui doesn't contain a index file
            // bind module to the complete module
            // "jquery-ui-1.10.3$": "jquery-ui-1.10.3/ui/jquery-ui.js",
        },
    },
    resolveLoader: {
        alias: {
            'config-loader': path.join(__dirname, './loaders/config-loader'),
            'htmlout-loader': path.join(__dirname, './loaders/htmlout-loader')
        }
        // fallback: [
        //     path.resolve(__dirname, 'loaders'),
        //     path.join(process.cwd(), 'node_modules')
        // ]
    },
    plugins: [
        // new webpack.ProvidePlugin({
        //     // Automtically detect jQuery and $ as free var in modules
        //     // and inject the jquery library
        //     // This is required by many jquery plugins
        //     jQuery: "jquery",
        //     $: "jquery"
        // }),
        new ClientPlugin(BASE_SRC_CLIENT, BASE_OUT_CLIENT),
        new webpack.ProvidePlugin({
            'THREE': 'three'
        }),
    ],
    context: path.join(BASE_SRC_CLIENT + '/apps'),
    node: {
        __filename: true
    },
};

module.exports = webpackConfig;
