
import * as React from 'react';
import {map, forEach} from './linearbuffer';
import {ViewItems, ViewItem, calculateInfo, updateViewItemInfo, addToNext, addToPrev} from './viewitems';

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

function needMore(unit: number, pos: number, filledStart: number, filledSize: number) {
    const boundMin = -pos;
    const boundMax = -pos + unit;
    console.log('needMore', pos, filledStart, boundMin, boundMax, filledStart + filledSize);
    return {
        prev: boundMin < filledStart,
        next: filledStart + filledSize < boundMax,
    };
}

type ViewOrientation = 'vertical' | 'horizontal';

export class View extends React.Component<{
    itemLen: number;
    height: number;
    orientation: ViewOrientation;
    renderer: (index: number) => React.ReactElement<any>
}, {
    x?: number;
    y?: number;
    activeIndex: number;
    viewItems: ViewItems;
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
        window['viewItems'] = this.state.viewItems;
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
            pos.y = 0;
        }
        this.setState({...pos});
    }

    private elRoot: HTMLDivElement;
    render() {
        const {
            itemLen,
            renderer,
            height,
        } = this.props;
        const {
            x,
            y,
            activeIndex,
            viewItems,
        } = this.state;

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
                        map(viewItems, ((viewItem) => (
                            <div ref={(ref) => viewItem.el = ref}
                                key={'' + viewItem.key}
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
                                renderer(viewItem.index)
                                }
                            </div>
                        )))
                    }
                </div>
            </div>
        );
    }

    private reconsileItems(force: boolean = false) {
        const {
            orientation,
            itemLen,
        } = this.props;
        const {
            x,
            y,
            viewItems
        } = this.state;
        const horizontal = orientation === 'horizontal';

        let dirty = false;
        // Update size
        dirty = calculateInfo(viewItems, horizontal);

        let itemFirst: ViewItem;
        let itemLast: ViewItem;
        let visibleSize = 0;
        forEach(viewItems, function(viewItem) {
            if (viewItem.visible) {
                if (!itemFirst) itemFirst = viewItem;
                visibleSize += horizontal ? viewItem.width : viewItem.height;
                itemLast = viewItem;
            }
        });

        // Need more
        const elRoot = this.elRoot;
        const need = horizontal
            ? needMore(elRoot.clientWidth, x, itemFirst.x, visibleSize)
            : needMore(elRoot.clientHeight, y, itemFirst.y, visibleSize);
        if (need.prev) {
            addToPrev(viewItems, itemLen);
            // dirty = true;
        }
        if (need.next) {
            addToNext(viewItems, itemLen);
            // dirty = true;
        }

        const update = force || dirty;
        if (update) {
            this.setState({viewItems});
        }
        console.log('reconsileItems', update, need, viewItems);
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