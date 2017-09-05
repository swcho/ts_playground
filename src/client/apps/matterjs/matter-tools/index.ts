
// import * as MatterTools from 'matter-tools/build/matter-tools.demo';
const Demo: IMatterTools = require('matter-tools/build/matter-tools.demo');

console.log(Demo);

type IMatterTools = any;

declare namespace IMatterTools {

    interface Demo {

    }

    interface Example {

    }

    namespace Demo {

        export function create(options?: {}): Demo;

        export function start(demo: Demo, initialExampleId: string);

        export function stop(demo: Demo);

        export function reset(demo: Demo);

        export function setExampleById(demo: Demo, exampleId: string);

        export function setExample(demo: Demo, example: Example);

        export function setInspector(demo: Demo, enabled: boolean);

        export function setGui(demo: Demo, enabled: boolean);

    }

    // TODO: https://github.com/liabru/matter-tools/blob/master/API.md#gui

    interface Gui {

    }

    namespace Gui {
    }

}

export = {
    Demo
};
