
import * as assert from 'assert';

import * as webpack from 'webpack';

export class ConfigPlugin {

    constructor() {

    }

    apply(compiler: webpack.Compiler) {
        // compiler.plugin('compilation', (compilation) => {
        //     console.log('compilation', compilation);
        //     if (compilation.__config__) {
        //         console.log('compilation with config', compilation.__config__);
        //     }
        // });
        compiler.plugin('emit', (compilation, callback) => {

            console.log('emit compilation', compilation.assets)

            assert(compilation.entries.length === 1, 'multiple entries?');

            const entry = compilation.entries[0];
            console.log(entry.context);


            if (compilation.__config__) {
                console.log('compilation with config');
                console.log(compilation.__config__);
            }

            // TODO: Output With Context
            if (compilation.__html__) {
                console.log('compilation with html');
                console.log(compilation.__html__);
            }

            callback();
        });

        compiler.plugin('done', () => {
            console.log('ConfigPlugin DONE')
        });
    }

}
