
import * as React from 'react';
import * as ReactDom from 'react-dom';

import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

class Component extends React.Component<{}, {}> {
    render() {
        return (
            <h1>Hello React~</h1>
        );
    }
}

ReactDom.render(<Component></Component>, document.getElementById('react-app'));