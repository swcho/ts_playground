
import * as assert from 'assert';
import * as debug from 'debug';
import * as fs from 'fs-extra';
import * as cheerio from 'cheerio';

import * as webpack from 'webpack';

const log = debug('plugin/config');

function out_html(outputOption: webpack.Output, path, html, config: Config, assets: string) {
    console.log('out_html', config, html);
    const $ = cheerio.load(html);
    Object.keys(assets)
        .filter(assetName => !/\.map$/.test(assetName))
        .forEach(assetName => {
            $('head').append(`<script type="text/javascript" src="/${outputOption.publicPath}${assetName}"/>`)
        });
    fs.outputFileSync(path, $.html());
}

interface CompilationInfo {
    context: string;
    config: Config;
    html: string;
}

interface CompilationInfoMap {
    [context: string]: CompilationInfo;
}

export class ClientPlugin {

    private src: string;
    private out: string;
    private compilationInfoMap: CompilationInfoMap = {};

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
        const compilationInfoMap = this.compilationInfoMap;
        compiler.plugin('emit', function(compilation, callback) {

            assert(compilation.entries.length === 1, 'multiple entries?');

            const contextCompiler = this.context;
            const contextCompilation = compilation.entries[0].context;
            console.log('\nDBG: emit', contextCompilation);
            const pathname = contextCompilation.replace(contextCompiler, '');
            const htmlPath = `${out}${pathname}/index.html`;

            const compilationInfo = compilationInfoMap[contextCompilation];
            const config: Config = compilation.__config__ || compilationInfo && compilationInfo.config;
            const html: string = compilation.__html__ || compilationInfo && compilationInfo.html;

            if (config && html) {
                console.log('\nDBG: compilation with html');
                compilationInfoMap[contextCompilation] = {
                    context: contextCompilation,
                    config,
                    html
                };
                out_html(compilation.outputOptions, htmlPath, html, config, compilation.assets);
            }

            callback();
        });

        compiler.plugin('done', () => {
            console.log('\nDBG: ConfigPlugin DONE')
        });
    }

}
