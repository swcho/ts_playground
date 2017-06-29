
import * as path from 'path';

import * as webpack from 'webpack';
import * as webpackMerge from 'webpack-merge';

import * as common from './webpack.config';

const webpackConfig: webpack.Configuration = webpackMerge(
    common,
    {
        output: {
            filename: "[name].js",
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
        ],
        // devServer: {
        //     hot: true,
        //     contentBase: "out/client",
        // }
    }
);

module.exports = webpackConfig;
