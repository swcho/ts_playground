import * as loaderUtils from 'loader-utils';
import * as _eval from 'eval';
import * as webpack from 'webpack';

const debug = require('debug')('loader/config');
// ref: https://github.com/webpack/webpack/issues/903
module.exports = function(this: webpack.loader.LoaderContext, source) {
    // console.log('config-loader', source);
    const config = _eval(source);
    this._module.__config__ = config;
    this._module.issuer.__config__ = config;
    // do foo
    // debug('start', source.length);
    // var foo = loaderUtils.getLoaderConfig(this, 'foo');
    // debug('isBaz', foo.bar === 'baz');
    // debug('isQoo', foo.qux === 'qoo');
    return source;
}
