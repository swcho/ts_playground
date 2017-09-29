
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import * as React from 'react';
import * as ReactDom from 'react-dom';
import styled from 'styled-components';
import {View} from './view';
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

const StyledItem = styled.ul`
    width: 200px;
    border: 1px solid green;
    height: 500px;
    .content {
        width: 200px;
        height: 500px;
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
                    height={200}
                    renderer={
                        (index) => {
                            const item = data[index];
                            return (
                                <StyledItem>
                                    <div className='content'>
                                        <li className='name'>{item.first_name}</li>
                                        <li className='email'>{item.email}</li>
                                        <li className='img'><img src={item.img}/></li>
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