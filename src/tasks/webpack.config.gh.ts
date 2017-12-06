

import * as webpack from 'webpack';
import * as webpackMerge from 'webpack-merge';

// import * as common from './webpack.config';
const common = require('./webpack.config')

// const entry = {...common.entry, }

const webpackConfig: webpack.Configuration = webpackMerge(
    common,
    {
        output: {
            publicPath: "//swcho.github.io/ts_playground/dist/client/assets/",
        },
        plugins: [
            new webpack.DefinePlugin({
                "process.env": {
                    "NODE_ENV": JSON.stringify("production")
                }
            }),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin()
        ],
    }
);

module.exports = webpackConfig;
