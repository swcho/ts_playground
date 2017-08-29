
import * as React from 'react';
import styled from 'styled-components';
// import {Motion} from 'react-motion';

interface Item {
    color: string;
    text: string;
}

const INIT_ITEMS: Item[] = [
    {
        color: '#ef767a',
        text: 'A'
    },
    {
        color: '#456990',
        text: 'B'
    },
    {
        color: '#49beaa',
        text: 'C'
    },
    {
        color: '#eeb868',
        text: 'D'
    },
    {
        color: '#ef767a',
        text: 'E'
    },
    {
        color: '#456990',
        text: 'F'
    },
    {
        color: '#49beaa',
        text: 'G'
    },
    {
        color: '#eeb868',
        text: 'H'
    },
    {
        color: '#ef767a',
        text: 'I'
    },
    {
        color: '#456990',
        text: 'J'
    },
    {
        color: '#49beaa',
        text: 'K'
    },
    {
        color: '#eeb868',
        text: 'L'
    },
];

interface BallProps {
    left: number;
    top: number;
    color: string;
    dragging?: boolean;
}

const Ball = styled.div`
    position: absolute;
    top: ${(props: BallProps) => props.top + ''}px;
    left: ${(props) => props.left + ''}px;
    border: 1px solid black;
    border-radius: 99px;
    width: 50px;
    height: 50px;
    text-align: center;
    background-color: ${props => props.color};
    // transform: ${props => props.dragging ? 'translateX(-9999px)' : ''};
    // visibility: ${props => props.dragging ? 'hidden' : 'visible'};
    &:before {
        display: inline-block;
        content: '';
        height: 100%;
        width: 1px;
        vertical-align: middle;
    }
    span {
        vertical-align: middle;
    }
`;

const COL_COUNT = 3;

export class DraggableBalls extends React.Component<{
    className?: string;
}, {
    draggingIndex: number;
    items: Item[];
}> {

    constructor(props) {
        super(props);
        this.state = {
            draggingIndex: -1,
            items: INIT_ITEMS,
        };
    }

    render() {
        const {
            className
        } = this.props;
        const {
            draggingIndex,
            items,
        } = this.state;
        return (
            <div className={className}>
                <h1>Draggable Balls</h1>
                <div className='container'
                    onDragOver={
                        (e) => {
                            console.log(e.clientX, e.clientY);
                        }
                    }
                >
                {
                    items.map((item, i) => {
                        return (
                            <Ball
                                key={i}
                                draggable
                                color={item.color}
                                top={Math.floor(i / COL_COUNT) * 100}
                                left={i % COL_COUNT * 100}
                                dragging={draggingIndex === i}
                                onDragStart={
                                    (e) => {
                                        console.log('onDragStart');
                                        this.setState({
                                            draggingIndex: i,
                                        });
                                    }
                                }
                                onDragEnd={
                                    () => {
                                        console.log('onDrageEnd');
                                        this.setState({
                                            draggingIndex: -1,
                                        });
                                    }
                                }
                                onDrop={
                                    () => {
                                        console.log('onDrop');
                                        const source = items[draggingIndex];
                                        const target = items[i];
                                        items.splice(draggingIndex, 1, target);
                                        items.splice(i, 1, source);
                                        this.setState({items});
                                    }
                                }
                                onDragOver={
                                    () => {
                                        if (draggingIndex === i) {
                                            return;
                                        }
                                        console.log('onDragOver');
                                    }
                                }
                            >
                                <span>{item.text}</span>
                            </Ball>
                        );
                    })
                }
                </div>
            </div>
        );
    }
}

export const StyledDraggableBalls = styled(DraggableBalls)`
    .container {
        position: relative;
    }
`;