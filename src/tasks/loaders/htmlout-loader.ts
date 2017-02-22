import * as loaderUtils from 'loader-utils';
import * as webpack from 'webpack';

module.exports = function(this: webpack.loader.LoaderContext, source) {
    console.log('html-loader', source);
    this._compilation.__html__ = source;
    return '';
}
