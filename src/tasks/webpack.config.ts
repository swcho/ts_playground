
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
const entryInfoList = configList.map<EntryInfo>(configPath => {
    const dir = configPath.replace(`/${CONFIG_FILE_NAME}`, '');
    const pathname = dir.replace(BASE_SRC_APPS, '');
    const entryFilePath = glob.sync(`${dir}/${APP_FILE_NAME}`)[0];
    const chunkName = pathname.replace('/', '_');
    return {
        pathname,
        entryFilePath,
        chunkName
    };
});

const entries = entryInfoList.reduce((ret, info) => {
    ret[info.chunkName] = info.entryFilePath;
    return ret;
}, {})

module.exports = {
    cache: true,
    entry: entries,
    output: {
        path: path.join(__dirname, "../client/assets"),
        publicPath: "assets/",
        filename: "[name].[chunkhash].js",
        chunkFilename: "[chunkhash].js"
    },
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: 'html-loader'
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
                loader: "style-loader!css-loader"
            },
            {
                test: /\.less$/,
                loader: "style-loader!css-loader!less-loader"
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

            // images
            {
                test: /\.png$/,
                loader: "file-loader?prefix=imgs/"
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
        // alias: {
        //     // Bind version of jquery
        //     jquery: "jquery-2.0.3",

        //     // Bind version of jquery-ui
        //     "jquery-ui": "jquery-ui-1.10.3",

        //     // jquery-ui doesn't contain a index file
        //     // bind module to the complete module
        //     "jquery-ui-1.10.3$": "jquery-ui-1.10.3/ui/jquery-ui.js",
        // },
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
        // new webpack.ProvidePlugin({
        //     // Automtically detect jQuery and $ as free var in modules
        //     // and inject the jquery library
        //     // This is required by many jquery plugins
        //     jQuery: "jquery",
        //     $: "jquery"
        // }),
        new ClientPlugin(BASE_SRC_CLIENT, BASE_OUT_CLIENT)
    ],
    context: path.join(BASE_SRC_CLIENT + '/apps'),
    node: {
        __filename: true
    }
};
