
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import * as React from 'react';
import * as ReactDom from 'react-dom';
import styled from 'styled-components';
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
    border: 1px solid green;
    .name {
        font-size: 20px;
        line-height: 40px;
    }
    .email {
        font-size: 18px;
        line-height: 30px;
    }
`;

interface Pos {
    x: number;
    y: number;
}

function flick(value: number, speed: number, cb: (value: number) => void) {
    const minus = value < 0;
    value = Math.abs(value);
    const interval = setInterval(function() {
        value -= speed;
        cb(minus ? -value : value);
        if (value <= 0) {
            clearInterval(interval);
        }
    }, 16);
}


interface ViewItem {
    key: number;
    index: number;
    el?: HTMLDivElement;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    visible?: boolean;
}


function updateViewItemInfo(viewItem: ViewItem) {
    const {
        el
    } = viewItem;
    const elChild = el.children[0] as HTMLElement;
    viewItem.width = elChild.clientWidth;
    viewItem.height = elChild.clientHeight;
    viewItem.visible = true;
}

function needMore(unit: number, pos: number, filledStart: number, filledSize: number) {
    const boundMin = pos - unit;
    const boundMax = pos + unit * 2;
    return {
        prev: boundMin < filledStart,
        next: filledStart + filledSize < boundMax,
    };
}

type ViewOrientation = 'vertical' | 'horizontal';

class View extends React.Component<{
    items: any[];
    height: number;
    orientation: ViewOrientation;
    renderer: (item) => React.ReactElement<any>
}, {
    x?: number;
    y?: number;
    activeIndex: number;
    viewItems: ViewItem[];
}> {

    constructor(props) {
        super(props);
        this.state = {
            x: 0,
            y: 0,
            activeIndex: 0,
            viewItems: [{
                key: 0,
                index: 0,
                x: 0,
                y: 0,
                visible: true,
            }]
        };
    }

    private posPrev: Pos = null;
    private divApplied: Pos = null;

    private getRootPos(): Pos {
        const elRoot = this.refs['root'] as HTMLDivElement;
        const rect = elRoot.getBoundingClientRect();
        return {
            x: 0,
            y: 0,
        };
    }

    private move(pos: Partial<Pos>) {
        const {
            orientation,
        } = this.props;
        // if (pos.x !== undefined) {
        //     if (pos.x < 0) {
        //         pos.x = 0;
        //     }
        // }
        if (orientation === 'horizontal' && pos.y !== undefined) {
            if (pos.y < 0) {
                pos.y = 0;
            }
        }
        this.setState({...pos});
    }

    private elRoot: HTMLDivElement;
    render() {
        const {
            items,
            renderer,
            height,
        } = this.props;
        const {
            x,
            y,
            activeIndex,
            viewItems,
        } = this.state;

        const activeItem = items[activeIndex];
        return (
            <div
                ref={(ref) => this.elRoot = ref}
                style={{
                    position: 'absolute',
                    overflow: 'hidden',
                    width: `100vw`,
                    height: `100vh`,
                    border: '1px solid red',
                }}
                onTouchStart={
                    (e) => {
                        const t = e.touches[e.touches.length - 1];
                        this.posPrev = {
                            x: t.pageX,
                            y: t.pageY,
                        };
                        console.log('start', this.posPrev);
                    }
                }
                onTouchMove={
                    (e) => {
                        if (this.posPrev) {
                            const t = e.touches[e.touches.length - 1];
                            const newPos = {
                                x: t.pageX,
                                y: t.pageY,
                            };
                            const divX = newPos.x - this.posPrev.x;
                            const divY = newPos.y - this.posPrev.y;
                            const applyX = Math.abs(divX) > Math.abs(divY);
                            this.posPrev = newPos;
                            console.log('move', this.posPrev, divX, divY);
                            const divApplied = {
                                x: (applyX ? divX : 0),
                                y: (applyX ? 0 : divY),
                            };
                            this.divApplied = divApplied;
                            this.move({
                                x: x + divApplied.x,
                                y: y + divApplied.y,
                            });
                        }
                    }
                }
                onTouchEnd={
                    (e) => {
                        this.posPrev = null;
                        if (this.divApplied) {
                            const {
                                x,
                                y,
                            } = this.divApplied;
                            console.log('end', x, y);
                            if (y === 0) {
                                flick(x, 1, (divX) => {
                                    console.log('flick', divX);
                                    this.move({x: this.state.x + divX});
                                });
                            } else {
                                flick(y, 1, (divY) => {
                                    console.log('flick', divY);
                                    this.move({y: this.state.y + divY});
                                });
                            }
                            this.divApplied = null;
                        }
                    }
                }
            >
                <div
                    style={{
                        position: 'absolute',
                        height: `${height}px`,
                        border: '1px solid blue',
                        transform: `translateX(${x}px) translateY(${y}px)`,
                    }}
                >
                    <div style={{
                        width: '1px',
                        height: '1px',
                        backgroundColor: 'red',
                    }}></div>
                    {
                        viewItems.map((viewItem) => (
                            <div ref={(ref) => viewItem.el = ref}
                                key={viewItem.key}
                                style={{
                                    position: 'absolute',
                                    backgroundColor: 'red',
                                    visibility: viewItem.visible ? 'visible' : 'hidden',
                                    left: viewItem.x || 0,
                                    top: viewItem.y || 0,
                                    width: viewItem.width || 0,
                                    height: viewItem.height || 0,
                                }}
                            >
                                {
                                renderer(items[viewItem.index])
                                }
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }

    private reconsileItems(force: boolean = false) {
        const {
            orientation,
        } = this.props;
        const {
            x,
            y,
            viewItems
        } = this.state;
        const horizontal = orientation === 'horizontal';

        let itemFirst: ViewItem;
        let itemLast: ViewItem;
        let visibleSize = 0;
        for (const viewItem of viewItems) {
            if (viewItem.visible) {
                if (!itemFirst) itemFirst = viewItem;
                visibleSize += horizontal ? viewItem.width : viewItem.height;
                itemLast = viewItem;
            }
        }

        let dirty = false;

        // Update size
        for (const viewItem of viewItems) {
            if (!viewItem.visible) {
                updateViewItemInfo(viewItem);
                dirty = true;
            }
        }

        // Need more
        const elRoot = this.elRoot;
        const need = horizontal
            ? needMore(elRoot.clientWidth, x, itemFirst.x, visibleSize)
            : needMore(elRoot.clientHeight, y, itemFirst.y, visibleSize);
        if (need.prev) {
        }
        if (need.next) {
        }

        const update = force || dirty;
        if (update) {
            this.setState({viewItems});
        }
        console.log('reconsileItems', update, viewItems);
    }

    componentDidMount() {
        const {
            viewItems,
        } = this.state;
        const firstItem = viewItems[0];
        updateViewItemInfo(firstItem);
        this.reconsileItems(true);
    }

    componentDidUpdate() {
        this.reconsileItems();
    }

}

class App extends React.Component<{}, {}> {

    render() {
        return (
            <div>
                <View
                    height={200}
                    items={data}
                    orientation='horizontal'
                    renderer={
                        (item) => {
                            return (
                                <StyledItem style={{position: 'absolute'}}>
                                    <li className='name'>{item.first_name}</li>
                                    <li className='email'>{item.email}</li>
                                    <li className='img'><img src={item.img}/></li>
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