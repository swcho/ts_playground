
import * as assert from 'assert';
import * as debug from 'debug';
import * as fs from 'fs-extra';
import * as cheerio from 'cheerio';

import * as webpack from 'webpack';

const log = debug('plugin/config');

function out_html(outputOption: webpack.Output, path, content, config: Config, assets: string) {
    const $ = cheerio.load(content);
    Object.keys(assets)
        .filter(assetName => /\.map$/.test(assetName))
        .forEach(assetName => {
            $('head').append(`<script type="text/javascript" src="${outputOption.publicPath}${assetName}"/>`)
        });
    fs.outputFileSync(path, $.html());
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

            if (config && compilation.__html__) {
                log('compilation with html');
                out_html(compilation.outputOptions, htmlPath, compilation.__html__, config, compilation.assets);
            }

            callback();
        });

        compiler.plugin('done', () => {
            console.log('ConfigPlugin DONE')
        });
    }

}
