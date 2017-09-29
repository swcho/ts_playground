

import * as webpack from 'webpack';
import * as webpackMerge from 'webpack-merge';

// import * as common from './webpack.config';
const common = require('./webpack.config')

// const entry = {...common.entry, }

const webpackConfig: webpack.Configuration = webpackMerge(
    common,
    {
        // entry : {
        //     client: [
        //         'react-hot-loader/patch',
        //         'webpack-hot-middleware/client',
        //     ]
        // },
        output: {
            filename: '[name].[hash].js',
            chunkFilename: '[name].[hash].js',
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            // new webpack.NoEmitOnErrorsPlugin(),
        ],
        devServer: {
            hot: true,
            contentBase: 'out/client',
            disableHostCheck: true,
        },
        devtool: 'inline-source-map',
    }
);

module.exports = webpackConfig;
