
import {Compiler} from 'webpack';

export class ConfigPlugin {

    constructor() {

    }

    apply(compiler: Compiler) {
        // compiler.plugin('compilation', (compilation) => {
        //     console.log('compilation', compilation);
        //     if (compilation.__config__) {
        //         console.log('compilation with config', compilation.__config__);
        //     }
        // });
        compiler.plugin('emit', (compilation, callback) => {

            if (compilation.__config__) {
                console.log('compilation with config', compilation.__config__);
            }

            callback();
        });
        compiler.plugin('done', () => {
            console.log('ConfigPlugin DONE')
        });
    }

}
