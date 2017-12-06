
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import * as React from 'react';
import * as ReactDom from 'react-dom';
import {HashRouter} from 'react-router-dom';

class Component extends React.Component<{}, {
    items: {
        key: string;
        size: number;
    }[];
}> {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <HashRouter>
                <table>

                </table>
            </HashRouter>
        );
    }
}

ReactDom.render(<Component></Component>, document.getElementById('react-app'));