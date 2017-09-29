
import * as React from 'react';
import {map} from './linearbuffer';
import {ViewItems, ViewItem, updateViewItemInfo, reconcile, getNextAnchorableItem, getPrevAnchorableItem, setActive} from './viewitems';
import {Pointings, MoveStartHandler, MoveHandler, MoveFinishHandler} from './pointings';

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

const USE_TOUCH = true;

type ViewOrientation = 'vertical' | 'horizontal';

interface Props {
    itemLen: number;
    orientation: ViewOrientation;
    anchorPos?: number;
    startIndex?: number;
    transitionDuration?: number;
    renderer: (viewItem: ViewItem) => React.ReactElement<any>;
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
        transitionDuration: 300,
    };

    private pointings: Pointings;

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
            active: true,
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

        this.pointings = new Pointings(this.onMoveStart, this.onMove, this.onMoveFinish);
    }

    private posStart: Pos = null;
    private onMoveStart: MoveStartHandler = () => {
        const {x, y} = this.state;
        this.posStart = {x, y};
    }

    private onMove: MoveHandler = (divX: number, divY: number) => {
        const {
            x, y
        } = this.state;
        this.move({
            x: x + divX,
            y: y + divY,
        });
        this.posStart = {
            x,
            y,
        };
    }

    private onMoveFinish: MoveFinishHandler = (summary) => {
        const {
            anchorPos,
            orientation,
        } = this.props;
        const {
            x,
            y,
            viewItems,
        } = this.state;
        const {
            moveTotal,
            xMoved,
            yMoved,
        } = summary;
        const horizontal = orientation === 'horizontal';

        this.setState({transitioning: true});
        if (35 < Math.abs(moveTotal)) {
            if (horizontal && xMoved) {
                const anchorX = -x + anchorPos;
                if (moveTotal < 0) {
                    const next = getNextAnchorableItem(viewItems, horizontal, anchorX);
                    setActive(viewItems, next);
                    this.move({x: anchorPos - next.x}, true);
                    console.log('next', next);
                } else {
                    const prev = getPrevAnchorableItem(viewItems, horizontal, anchorX);
                    setActive(viewItems, prev);
                    this.move({x: anchorPos - prev.x}, true);
                    console.log('prev', prev);
                }
            }
            if (!horizontal && yMoved) {
                const anchorY = -y + anchorPos;
                if (moveTotal < 0) {
                    const next = getNextAnchorableItem(viewItems, horizontal, anchorY);
                    setActive(viewItems, next);
                    this.move({y: anchorPos - next.y}, true);
                    console.log('next', next);
                } else {
                    const prev = getPrevAnchorableItem(viewItems, horizontal, anchorY);
                    setActive(viewItems, prev);
                    this.move({y: anchorPos - prev.y}, true);
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
        this.setState({
            ...pos,
            transitioning,
        });
    }

    private elRoot: HTMLDivElement;
    render() {
        const {
            renderer,
            orientation,
            transitionDuration,
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
                onMouseDown={
                    (e) => {
                        this.pointings.processStart({
                            x: e.pageX,
                            y: e.pageY,
                        });
                    }
                }
                onMouseMove={
                    (e) => {
                        this.pointings.processMove({
                            x: e.pageX,
                            y: e.pageY,
                        });
                    }
                }
                onMouseUp={(e) => this.pointings.processEnd()}
                onMouseLeave={(e) => this.pointings.processEnd()}
                onMouseOut={(e) => this.pointings.processEnd()}
                onTouchStart={
                    (e) => {
                        if (USE_TOUCH) {
                            const t = e.touches[e.touches.length - 1];
                            this.pointings.processStart({
                                x: t.pageX,
                                y: t.pageY,
                            });
                        }
                    }
                }
                onTouchMove={
                    (e) => {
                        if (USE_TOUCH) {
                            const t = e.touches[e.touches.length - 1];
                            this.pointings.processMove({
                                x: t.pageX,
                                y: t.pageY,
                            });
                        }
                    }
                }
                onTouchEnd={
                    (e) => {
                        if (USE_TOUCH) {
                            this.pointings.processEnd();
                        }
                    }
                }
            >
                <div
                    style={{
                        position: 'absolute',
                        // border: '1px solid blue',
                        transform: `translate3d(${x}px, ${y}px, 0)`,
                        transition: transitioning && `transform ${transitionDuration}ms ease`,
                    }}
                >
                    {
                        map(viewItems, ((viewItem) => (
                            <div ref={(ref) => viewItem.el = ref}
                                key={'' + viewItem.key}
                                style={{
                                    position: 'absolute',
                                    visibility: viewItem.visible ? 'visible' : 'hidden',
                                    left: viewItem.x || 0,
                                    top: viewItem.y || 0,
                                    width: !horizontal && this.elRoot && this.elRoot.clientWidth || viewItem.width || 0,
                                    height: horizontal && this.elRoot && this.elRoot.clientHeight || viewItem.height || 0,
                                    overflowY: 'auto',
                                    touchAction: horizontal ? 'pan-y' : 'pan-x',
                                }}
                            >
                                {
                                renderer(viewItem)
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