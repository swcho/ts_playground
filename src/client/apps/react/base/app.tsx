
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

import * as React from 'react';
import * as ReactDom from 'react-dom';

class App extends React.Component<{}, {}> {

    render() {
        return (
            <div>
                <h1>App</h1>
            </div>
        );
    }
}

ReactDom.render(<App/>, document.getElementById('react-app'));
