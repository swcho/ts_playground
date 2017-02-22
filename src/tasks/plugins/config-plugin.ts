
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


            if (compilation.__config__) {
                console.log('compilation with config', compilation.__config__);
            }

            if (compilation.__html__) {
                console.log('compilation with html', compilation.__html__);
            }

            callback();
        });
        compiler.plugin('done', () => {
            console.log('ConfigPlugin DONE')
        });
    }

}
