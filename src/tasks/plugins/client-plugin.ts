
import * as assert from 'assert';
import * as debug from 'debug';
import * as fs from 'fs-extra';
import * as cheerio from 'cheerio';

import * as webpack from 'webpack';

const log = debug('plugin/config');

function out_html(path, content, config: Config, assets: string) {
    fs.outputFileSync(path, content);
}

export class ClientPlugin {

    private src: string;
    private out: string;

    constructor(src: string, out: string) {
        this.src = src;
        this.out = out;
    }

    apply(compiler) {
        // compiler.plugin('compilation', (compilation) => {
        //     console.log('compilation', compilation);
        //     if (compilation.__config__) {
        //         console.log('compilation with config', compilation.__config__);
        //     }
        // });
        const out = this.out;
        compiler.plugin('emit', function(compilation, callback) {

            assert(compilation.entries.length === 1, 'multiple entries?');

            const contextCompiler = this.context;
            const contextCompilation = compilation.entries[0].context;
            const pathname = contextCompilation.replace(contextCompiler, '');
            const htmlPath = `${out}${pathname}/index.html`;

            const config: Config = compilation.__config__;

            // TODO: Output With Context
            if (config && compilation.__html__) {
                log('compilation with html');
                out_html(htmlPath, compilation.__html__, config, compilation.assets);
            }

            callback();
        });

        compiler.plugin('done', () => {
            console.log('ConfigPlugin DONE')
        });
    }

}
