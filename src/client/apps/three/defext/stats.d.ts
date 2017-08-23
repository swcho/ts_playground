

declare module 'stats.js' {
    class Stats {
        domElement: HTMLDivElement;
        update();
    }
    namespace Stats {
        export class Panel {
            constructor(name: string, fg: stirng, bg: string);
        }
    }
    export = Stats;
}
