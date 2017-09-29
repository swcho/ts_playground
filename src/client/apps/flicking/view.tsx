
import * as React from 'react';
import {map} from './linearbuffer';
import {ViewItems, ViewItem, updateViewItemInfo, reconcile, getNextAnchorableItem, getPrevAnchorableItem} from './viewitems';

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

type ViewOrientation = 'vertical' | 'horizontal';

interface Props {
    itemLen: number;
    height: number;
    orientation: ViewOrientation;
    anchorPos?: number;
    startIndex?: number;
    renderer: (index: number) => React.ReactElement<any>;
}

export class View extends React.Component<Props, {
    x?: number;
    y?: number;
    activeIndex: number;
    viewItems: ViewItems;
    transitioning?: boolean;
}> {

    static defaultProps: Partial<Props> = {
        anchorPos: 0,
        startIndex: 0,
    };

    constructor(props: Props) {
        super(props);
        const {
            orientation,
            startIndex,
            anchorPos,
        } = this.props;

        const horizontal = orientation === 'horizontal';
        const initialIndex = startIndex || 0;
        const initialItem: ViewItem = {
            key: 0,
            index: initialIndex,
        };
        if (anchorPos !== undefined) {
            if (horizontal) {
                initialItem.x = anchorPos;
                initialItem.y = 0;
            } else {
                initialItem.y = anchorPos;
                initialItem.x = 0;
            }
        }

        this.state = {
            x: 0,
            y: 0,
            activeIndex: 0,
            viewItems: [initialItem],
        };
        window['viewItems'] = this.state.viewItems;
    }

    private getRootPos(): Pos {
        const elRoot = this.refs['root'] as HTMLDivElement;
        const rect = elRoot.getBoundingClientRect();
        return {
            x: 0,
            y: 0,
        };
    }

    private move(pos: Partial<Pos>, transitioning = false) {
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
        requestAnimationFrame(() => {
            this.setState({
                ...pos,
                transitioning,
            });
        });
    }

    private elRoot: HTMLDivElement;
    private posStart: Pos = null;
    private posPrev: Pos = null;
    private divPrev: Pos = null;
    private moveCount = 0;
    render() {
        const {
            renderer,
            height,
            orientation,
            anchorPos,
        } = this.props;
        const {
            x,
            y,
            viewItems,
            transitioning,
        } = this.state;
        const horizontal = orientation === 'horizontal';

        return (
            <div
                ref={(ref) => this.elRoot = ref}
                style={{
                    position: 'absolute',
                    overflow: 'hidden',
                    width: `100vw`,
                    height: `100vh`,
                    border: '1px solid red',
                    // touchAction: horizontal ? 'pan-x' : 'pan-y',
                    touchAction: 'none',
                }}
                onTouchStart={
                    (e) => {
                        const t = e.touches[e.touches.length - 1];
                        this.posStart = {
                            x,
                            y,
                        };
                        this.posPrev = {
                            x: t.pageX,
                            y: t.pageY,
                        };
                        console.log('start', this.posStart);
                    }
                }
                onTouchMove={
                    (e) => {
                        if (this.posStart) {
                            const t = e.touches[e.touches.length - 1];
                            const newPos = {
                                x: t.pageX,
                                y: t.pageY,
                            };
                            const divX = newPos.x - this.posPrev.x;
                            const divY = newPos.y - this.posPrev.y;
                            const applyX = Math.abs(divX) > Math.abs(divY);
                            this.posPrev = newPos;
                            const div = {
                                x: (applyX ? divX : 0),
                                y: (applyX ? 0 : divY),
                            };
                            if (!this.divPrev
                                || (div.x === 0 && this.divPrev.x === 0) || (div.y === 0 && this.divPrev.y === 0) // check same direction
                                ) {
                                this.divPrev = div;
                                this.move({
                                    x: x + div.x,
                                    y: y + div.y,
                                });
                                this.moveCount++;
                                console.log('move', this.posPrev, divX, divY);
                            }
                        }
                    }
                }
                onTouchEnd={
                    (e) => {
                        if (this.divPrev) {
                            this.setState({transitioning: true});
                            if (1 < this.moveCount) {
                                const {
                                    x: divX,
                                    y: divY,
                                } = this.divPrev;
                                console.log('end', divX, divY, x, anchorPos);
                                if (divY === 0) {
                                    const anchorX = -x + anchorPos;
                                    if (divX < 0) {
                                        const next = getNextAnchorableItem(viewItems, horizontal, anchorX);
                                        this.move({x: anchorPos - next.x}, true);
                                        console.log('next', anchorX, next);
                                    } else {
                                        const prev = getPrevAnchorableItem(viewItems, horizontal, anchorX);
                                        this.move({x: anchorPos - prev.x}, true);
                                        console.log('prev', prev);
                                    }
                                }
                                {/* if (y === 0) {
                                    flick(x, 1, (divX) => {
                                        console.log('flick', divX);
                                        this.move({x: this.state.x + divX});
                                    });
                                } else {
                                    flick(y, 1, (divY) => {
                                        console.log('flick', divY);
                                        this.move({y: this.state.y + divY});
                                    });
                                } */}
                            } else {
                                this.move(this.posStart, true);
                            }
                            this.divPrev = null;
                        }
                        this.moveCount = 0;
                        this.posPrev = null;
                        this.posStart = null;
                    }
                }
            >
                <div
                    style={{
                        position: 'absolute',
                        height: `${height}px`,
                        border: '1px solid blue',
                        transform: `translate3d(${x}px, ${y}px, 0)`,
                        transition: transitioning && `transform .3s ease`,
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

    private reconcile() {
        const {
            orientation,
            itemLen,
        } = this.props;
        const {
            x,
            y,
            viewItems
        } = this.state;
        const elRoot = this.elRoot;
        const horizontal = orientation === 'horizontal';
        const updated = reconcile(
            viewItems,
            horizontal,
            horizontal ? elRoot.clientWidth : elRoot.clientHeight,
            horizontal ? x : y,
            itemLen
        );
        if (updated) {
            this.setState({viewItems});
        }
    }

    componentDidMount() {
        const {
            viewItems,
        } = this.state;
        const firstItem = viewItems[0];
        updateViewItemInfo(firstItem);
        this.reconcile();
    }

    componentDidUpdate() {
        this.reconcile();
    }

}