
import * as path from 'path';

import * as assert from 'assert';
import * as debug from 'debug';
import * as fs from 'fs-extra';
import * as cheerio from 'cheerio';

import * as webpack from 'webpack';

// const log = debug('plugin/config');

function out_html(outputOption: webpack.Output, aPath, html, config: Config, assets: string[]) {
    // console.log('out_html', config, html);
    const $ = cheerio.load(html);
    // console.log('out_html', assets);
    // const relativeAssetPath = path.relative(path.dirname(aPath), outputOption.path);
    assets
        .filter(assetName => !/\.map$/.test(assetName))
        .forEach(assetName => {
            $('body').append(`<script type="text/javascript" src="${outputOption.publicPath}${assetName}"/>`)
        });
    fs.outputFileSync(aPath, $.html());
}

interface EntryInfo {
    context: string;
    config: Config;
    html: string;
}

interface EntryInfoMap {
    [context: string]: EntryInfo;
}

export class ClientPlugin {

    private src: string;
    private out: string;
    private entryInfoMap: EntryInfoMap = {};

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
        const entryInfoMap = this.entryInfoMap;
        compiler.plugin('emit', function(compilation, callback) {

            // assert(compilation.entries.length === 1, 'multiple entries?');

            const contextCompiler = this.context;
            compilation.entries.forEach((entry) => {
                const contextCompilation = entry.context;
                // console.log('\nDBG: emit', contextCompilation);
                const pathname = contextCompilation.replace(contextCompiler, '');
                const htmlPath = `${out}/${entry.name || pathname}/index.html`;

                const entryInfo = entryInfoMap[contextCompilation];
                const config: Config = entry.__config__
                    || entry.dependencies.reduce((ret, dependency) => ret || dependency.module && dependency.module.__config__, undefined)
                    || entryInfo && entryInfo.config;
                const html: string = entry.__html__
                    || entry.dependencies.reduce((ret, dependency) => ret || dependency.module && dependency.module.__html__, undefined)
                    || entryInfo && entryInfo.html;

                if (config && html) {
                    // console.log('\nDBG: compilation with html');
                    entryInfoMap[contextCompilation] = {
                        context: contextCompilation,
                        config,
                        html
                    };
                    const files = entry.chunks.map((chunk) => chunk.files[0]);
                    out_html(compilation.outputOptions, htmlPath, html, config, files); //compilation.assets);
                }
            });
            callback();
        });

        compiler.plugin('done', () => {
            // console.log('\nDBG: ConfigPlugin DONE')
        });
    }

}
