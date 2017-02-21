import * as loaderUtils from 'loader-utils';

const debug = require('debug')('loader/foo');
// ref: https://github.com/webpack/webpack/issues/903
module.exports = function(source) {
    console.log('config-loader', source);
    // do foo
    debug('start', source.length);
    var config = loaderUtils.getLoaderConfig(this, 'foo');
    debug('isBaz', config.bar === 'baz');
    debug('isQoo', config.qux === 'qoo');
    return source;
}
