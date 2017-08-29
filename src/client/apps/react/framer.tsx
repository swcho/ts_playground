import * as React from 'react';
import styled from 'styled-components';
import {Motion, spring} from 'react-motion';

interface Item {
    key: string;
    text: string;
}

const ITEMS: Item[] = [
    {
        key: 'a',
        text: 'this is a',
    },
    {
        key: 'b',
        text: 'this is b',
    },
    {
        key: 'c',
        text: 'this is c',
    },
    {
        key: 'd',
        text: 'this is d',
    },
    {
        key: 'e',
        text: 'this is e',
    },
];

class Framer extends React.Component<{}, {}> {

    render() {
        return (
            <div>
                <h1>Framer</h1>
                <ul>
                <Motion
                    defaultStyle={{x: 0}}
                    style={{x: spring(100)}}
                    onRest={() => console.log('onRest')}
                >
                    {value => <li style={{transform: `translateX(${value.x}px)`}}>React {value.x}</li>}
                </Motion>
                </ul>
            </div>
        );
    }
}

export const StyledFramer = styled(Framer)`
`;