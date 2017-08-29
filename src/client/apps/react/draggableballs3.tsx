
import * as React from 'react';
import styled from 'styled-components';
import {OpaqueConfig, spring, Motion} from 'react-motion';
import range = require('lodash.range');

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

const Ball = styled.div`
    position: absolute;
    border: 1px solid black;
    border-radius: 99px;
    width: 50px;
    height: 50px;
    text-align: center;
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

type PreConfig = Pick<OpaqueConfig, 'stiffness' | 'damping'>;

const springSetting1: PreConfig = {
    stiffness: 180,
    damping: 10,
};

const springSetting2: PreConfig = {
    stiffness: 120,
    damping: 17,
};

function reinsert(arr: any[], from: number, to: number) {
    const _arr = arr.slice(0);
    const val = _arr[from];
    _arr.splice(from, 1);
    _arr.splice(to, 0, val);
    return _arr;
}

function clamp(n: number, min: number, max: number) {
    return Math.max(Math.min(n, max), min);
}

const allColors = [
    '#EF767A', '#456990', '#49BEAA', '#49DCB1', '#EEB868', '#EF767A', '#456990',
    '#49BEAA', '#49DCB1', '#EEB868', '#EF767A',
];

const [count, width, height] = [11, 70, 90];
// indexed by visual position
const layout = range(count).map(n => {
    const row = Math.floor(n / 3);
    const col = n % 3;
    return [width * col, height * row];
});

export class DraggableBalls extends React.Component<{
    className?: string;
}, {
    mouseXY: number[];
    mouseCircleDelta: number[];
    lastPress: number;
    isPressed: boolean;
    order: number[];
}> {

    constructor(props) {
        super(props);
        this.state = {
            mouseXY: [0, 0],
            mouseCircleDelta: [0, 0],
            lastPress: null,
            isPressed: false,
            order: range(count),
        };
    }

    componentDidMount() {
        window.addEventListener('touchmov', this.handleTouchMove);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    handleTouchStart = (key: number, pressLocation: [any, any], e) => {
        this.handleMouseDown(key, pressLocation, e.touches[0]);
    }

    handleTouchMove = (e) => {
        e.preventDefault();
        this.handleMouseMove(e.touches[0]);
    }

    handleMouseDown = (key: number, [pressX, pressY], {pageX, pageY}) => {
        console.log('handleMouseDown', key, pressX, pressY, pageX, pageY);
        this.setState({
            lastPress: key,
            isPressed: true,
            mouseCircleDelta: [pageX - pressX, pageY - pressY],
            mouseXY: [pressX, pressY],
        });
    }

    handleMouseMove = ({pageX, pageY}) => {
        const {
            order,
            lastPress,
            isPressed,
            mouseCircleDelta: [dx, dy],
        } = this.state;
        if (isPressed) {
            const mouseXY = [pageX - dx, pageY - dy];
            const col = clamp(Math.floor(mouseXY[0] / width), 0, 2);
            const row = clamp(Math.floor(mouseXY[1] / height), 0, Math.floor(count / 3));
            const index = row * 3 + col;
            const newOrder = reinsert(order, order.indexOf(lastPress), index);
            this.setState({mouseXY, order: newOrder});
        }
    }

    handleMouseUp = () => {
        this.setState({isPressed: false, mouseCircleDelta: [0, 0]});
    }

    render() {
        const {
            className
        } = this.props;
        const {
            order,
            lastPress,
            isPressed,
            mouseXY,
        } = this.state;
        return (
            <div className={className}>
                <h1>Draggable Balls</h1>
                <div className='container'>
                {order.map((_, key) => {
                    let style;
                    let x;
                    let y;
                    const visualPosition = order.indexOf(key);

                    if (key === lastPress && isPressed) {
                        [x, y] = mouseXY;
                        style = {
                            translateX: x,
                            translateY: y,
                            scale: spring(1.2, springSetting1),
                            boxShadow: spring((x - (3 * width - 50) / 2) / 15, springSetting1),
                        };
                    } else {
                        [x, y] = layout[visualPosition];
                        {/* console.log(visualPosition, x, y); */}
                        style = {
                            translateX: spring(x, springSetting2),
                            translateY: spring(y, springSetting2),
                            scale: spring(1, springSetting1),
                            boxShadow: spring((x - (3 * width - 50) / 2) / 15, springSetting1),
                        };
                    }
                    return (
                        <Motion key={key} style={style}>
                            {({translateX, translateY, scale, boxShadow}) => {
                                return (
                                    <Ball
                                        onMouseDown={(e) => this.handleMouseDown(key, [x, y], e)}
                                        onTouchStart={(e) => this.handleTouchStart(key, [x, y], e)}
                                        style={{
                                            backgroundColor: allColors[key],
                                            transform: `translate3d(${translateX}px, ${translateY}px, 0px) scale(${scale})`,
                                            webkitTransform: `translate3d(${translateX}px, ${translateY}px, 0px) scale(${scale})`,
                                            zIndex: key === lastPress ? 99 : visualPosition,
                                            boxShadow: `${boxShadow}px 5px 5px rgba(0, 0, 0, 0.5)`
                                        }}
                                    />
                                );
                            }}
                        </Motion>
                    );
                })}
                </div>
            </div>
        );
    }
}

export const StyledDraggableBalls3 = styled(DraggableBalls)`
    .container {
        position: relative;
    }
`;