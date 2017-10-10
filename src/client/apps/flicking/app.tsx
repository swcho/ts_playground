
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import * as React from 'react';
import * as ReactDom from 'react-dom';
import styled from 'styled-components';
// import {View} from './view';
import {View} from 'react-anchoring-view';

const data: Item[] = require('./data.json');

interface Item {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    gender: string;
    ip_address: string;
    img: string;
}

interface Props {
    active: boolean;
}

const StyledItem = styled.ul`
    width: 200px;
    border: 1px solid green;
    height: 1000px;
    opacity: ${(props: Props) => props.active ? 1 : .2};
    transition: all .8s ease;
    perspective: 1000px;
    .content {
        background-color: #d92b2f;
        transform: ${(props: Props) => props.active ? `rotateY(0)` : `rotateY(70deg)`};
        transform-origin: left center;
        width: 200px;
        height: 500px;
        transition: all .8s ease;
    }
    .name {
        font-size: 20px;
        line-height: 40px;
    }
    .email {
        font-size: 18px;
        line-height: 30px;
    }
`;

class App extends React.Component<{}, {}> {

    render() {
        return (
            <div>
                <View
                    itemLen={data.length}
                    orientation='horizontal'
                    anchorPos={10}
                    transitionDuration={600}
                    renderer={
                        (viewItem) => {
                            {/* const item = data[viewItem.index]; */}
                            return (
                                <StyledItem active={viewItem.active}>
                                    <div className={`content ${viewItem.active ? 'active' : ''}`}>
                                        <li className='name'>Index: {viewItem.index}</li>
                                        {/* <li className='name'>{item.first_name}</li>
                                        <li className='email'>{item.email}</li>
                                        <li className='img'><img src={item.img}/></li> */}
                                    </div>
                                </StyledItem>
                            );
                        }
                    }
                />
            </div>
        );
    }

}

ReactDom.render(<App/>, document.body);