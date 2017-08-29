
import * as React from 'react';
import styled from 'styled-components';
import {spring, Motion} from 'react-motion';

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
    color: string;
    dragging?: boolean;
}

const Ball = styled.div`
    position: absolute;
    border: 1px solid black;
    border-radius: 99px;
    width: 50px;
    height: 50px;
    text-align: center;
    background-color: ${(props: BallProps) => props.color};
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
    clickedIndex: number;
    draggingIndex: number;
    diffX?: number;
    diffY?: number;
    clientX?: number;
    clientY?: number;
    items: Item[];
}> {

    constructor(props) {
        super(props);
        this.state = {
            clickedIndex: -1,
            draggingIndex: -1,
            items: INIT_ITEMS,
        };
    }

    private offsetX;
    private offsetY;
    render() {
        const {
            className
        } = this.props;
        const {
            clickedIndex,
            draggingIndex,
            diffX,
            diffY,
            clientX,
            clientY,
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
                        const dragging = draggingIndex === i;
                        return (
                            <Motion
                                key={item.text}
                                defaultStyle={{
                                    x: 0,
                                    y: 0,
                                }}
                                style={{
                                    x: spring(dragging ? clientX : i % COL_COUNT * 100),
                                    y: spring(dragging ? clientY : Math.floor(i / COL_COUNT) * 100),
                                }}
                            >
                                {
                                    interpolatedStyle => (
                                        <Ball
                                            color={item.color}
                                            style={{
                                                transform: `translate(${interpolatedStyle.x}px, ${interpolatedStyle.y}px)`,
                                                zIndex: dragging ? 1 : 0,
                                            }}
                                            onClick={
                                                () => {
                                                    if (clickedIndex === -1) {
                                                        this.setState({clickedIndex: i});
                                                    } else {
                                                        const source = items[clickedIndex];
                                                        const target = items[i];
                                                        console.log('switch', source, target);
                                                        items.splice(clickedIndex, 1, target);
                                                        items.splice(i, 1, source);
                                                        this.setState({
                                                            clickedIndex: -1,
                                                            items
                                                        });
                                                    }
                                                }
                                            }
                                            onMouseDown={
                                                (e) => {
                                                    const {
                                                        clientX,
                                                        clientY,
                                                    } = e;
                                                    console.log('onMouseDown', clientX, clientY);
                                                    const diffX = clientX - interpolatedStyle.x;
                                                    const diffY = clientY - interpolatedStyle.y;
                                                    this.setState({
                                                        draggingIndex: i,
                                                        diffX,
                                                        diffY,
                                                        clientX: interpolatedStyle.x,
                                                        clientY: interpolatedStyle.y,
                                                    });
                                                    e.preventDefault();
                                                }
                                            }
                                            onMouseMove={
                                                (e) => {
                                                    if (draggingIndex === i) {
                                                        const {
                                                            clientX,
                                                            clientY,
                                                        } = e;
                                                        console.log('onMouseMove', item.text, clientX, clientY);
                                                        this.setState({
                                                            clientX: clientX - diffX,
                                                            clientY: clientY - diffY,
                                                        });
                                                    }
                                                    e.preventDefault();
                                                }
                                            }
                                            onMouseUp={
                                                (e) => {
                                                    if (draggingIndex === i) {
                                                        const {
                                                            clientX,
                                                            clientY,
                                                        } = e;
                                                        console.log('onMouseUp', clientX, clientY);
                                                        this.setState({
                                                            draggingIndex: -1,
                                                        });
                                                    }
                                                }
                                            }
                                            onMouseLeave={
                                                (e) => {
                                                    if (draggingIndex === i) {
                                                        const {
                                                            clientX,
                                                            clientY,
                                                        } = e;
                                                        console.log('onMouseLeave', clientX, clientY);
                                                        this.setState({
                                                            draggingIndex: -1,
                                                        });
                                                    }
                                                }
                                            }
                                        >
                                            <span>{item.text}</span>
                                        </Ball>
                                    )
                                }
                            </Motion>
                        );
                    })
                }
                </div>
            </div>
        );
    }
}

export const StyledDraggableBalls2 = styled(DraggableBalls)`
    .container {
        position: relative;
    }
`;