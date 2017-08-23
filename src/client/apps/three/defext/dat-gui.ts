
import dat = require('dat-gui');

declare module 'dat-gui' {

    interface GUI {
        add(target: Object, propName: string, min: number, max: number, step: number): dat.GUIController;
    }

    interface GUIController {
        __max: number;
        __min: number;
        __step: number;
        initialValue: any;
    }
}

export = dat;
