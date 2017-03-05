import * as loaderUtils from 'loader-utils';
import * as webpack from 'webpack';
import * as _eval from 'eval';

module.exports = function(this: webpack.loader.LoaderContext, source) {
    // console.log('html-loader', source);
    const html = _eval(source);
    this._module.__html__ = html;
    this._module.issuer.__html__ = html;
    return source;
}
