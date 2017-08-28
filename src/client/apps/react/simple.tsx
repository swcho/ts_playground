
import * as React from 'react';
import styled from 'styled-components';
import {Motion, spring} from 'react-motion';

const Bar = styled.div`
    border-radius: 4px;
    background-color: rgb(240, 240, 232);
    position: relative;
    margin: 5px 3px 10px;
    width: 450px;
    height: 50px;
`;

interface BlockProps {
    on?: boolean;
}

const Block = styled.div`
    left: ${(props: BlockProps) => `${props.on ? 400 : 0}px`};
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 4px;
    background-color: rgb(130, 181, 198);
    transition: ${(props: BlockProps) => typeof props.on === 'undefined' ? '' : 'left .3s ease-out'};
`;

export class SimpleMotion extends React.Component<{}, {
    on: boolean;
}> {

    constructor(props) {
        super(props);
        this.state = {
            on: false,
        };
    }

    render() {
        const {
            on
        } = this.state;
        return (
            <div>
                <h1>Simple Transition</h1>
                <Bar
                    onClick={
                        () => this.setState({on: !on})
                    }
                >
                    <Motion
                        defaultStyle={{left: 0}}
                        style={{left: spring(on ? 400 : 0)}}
                        onRest={() => console.log('onRest')}
                    >
                        {newStyle => <Block style={newStyle}></Block>}
                    </Motion>
                </Bar>
                <Bar
                    onClick={
                        () => this.setState({on: !on})
                    }
                >
                    <Block on={on}/>
                </Bar>
            </div>
        );
    }
};