
import * as React from 'react';
import * as ReactDom from 'react-dom';
import {HashRouter, Route, Link} from 'react-router-dom';
import {DefaultMotion} from './default';
import {SimpleMotion} from './simple';
import {ChatHeads} from './chatheads';
import {StyledDraggableBalls} from './draggableballs';
import {StyledDraggableBalls2} from './draggableballs2';
import {StyledDraggableBalls3} from './draggableballs3';
import {StyledTodo} from './todo';

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
                    <Link to='/draggableballs2'>DraggableBalls2</Link>
                    <Link to='/draggableballs3'>DraggableBalls3</Link>
                    <Link to='/todo'>To do</Link>
                    <Route path='/default' component={DefaultMotion}/>
                    <Route path='/simple' component={SimpleMotion}/>
                    <Route path='/chatheads' component={ChatHeads}/>
                    <Route path='/draggableballs' component={StyledDraggableBalls}/>
                    <Route path='/draggableballs2' component={StyledDraggableBalls2}/>
                    <Route path='/draggableballs3' component={StyledDraggableBalls3}/>
                    <Route path='/todo' component={StyledTodo}/>
                </div>
            </HashRouter>
        );
    }
}

ReactDom.render(<Component></Component>, document.getElementById('react-app'));
