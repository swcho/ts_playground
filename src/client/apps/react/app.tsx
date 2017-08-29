
import * as React from 'react';
import * as ReactDom from 'react-dom';
import {HashRouter, Route, Link} from 'react-router-dom';
import {DefaultMotion} from './default';
import {SimpleMotion} from './simple';
import {ChatHeads} from './chatheads';
import {StyledDraggableBalls} from './draggableballs';

import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

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
                <div>
                    <Link to='/default'>Default</Link>
                    <Link to='/simple'>Simple</Link>
                    <Link to='/chatheads'>Simple</Link>
                    <Link to='/draggableballs'>DraggableBalls</Link>
                    <Route path='/default' component={DefaultMotion}/>
                    <Route path='/simple' component={SimpleMotion}/>
                    <Route path='/chatheads' component={ChatHeads}/>
                    <Route path='/draggableballs' component={StyledDraggableBalls}/>
                </div>
            </HashRouter>
        );
    }
}

ReactDom.render(<Component></Component>, document.getElementById('react-app'));
