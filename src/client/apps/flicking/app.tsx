
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

const FlickView = styled.div`
    border: 1px solid red;
    position: absolute;
    overflow: hidden;
    width: ${(props) => props.height}px;
    height: ${(props) => props.height}px;
    .view {
        position: absolute;
        height: ${(props) => props.height}px;
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

class Flick extends React.Component<{
    height: number;
}, {
    x: number;
    y: number;
}> {

    constructor(props) {
        super(props);
        this.state = {
            x: 0,
            y: 0,
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

    render() {
        const {
            height
        } = this.props;
        const {
            x,
            y,
        } = this.state;
        return (
            <div
                ref='root'
                style={{
                    position: 'absolute',
                    overflow: 'hidden',
                    width: `${height}px`,
                    height: `${height}px`,
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
                            this.setState({
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
                                    this.setState({
                                        x: this.state.x + divX
                                    });
                                });
                            } else {
                                flick(y, 1, (divY) => {
                                    console.log('flick', divY);
                                    this.setState({
                                        y: this.state.y + divY
                                    });
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
                        transform: `translateX(${x}px) translateY(${y}px)`,
                    }}
                >
                    <div style={{
                        width: '1px',
                        height: '1px',
                        backgroundColor: 'red',
                    }}></div>
                {
                    data.map((item, i) => (
                        <StyledItem style={{position: 'absolute'}}>
                            <li className='name'>{item.first_name}</li>
                            <li className='email'>{item.email}</li>
                            <li className='img'><img src={item.img}/></li>
                        </StyledItem>
                    ))
                }
                </div>
            </div>
        );
    }

}

class App extends React.Component<{}, {}> {

    render() {
        return (
            <div>
                <Flick height={200}/>
            </div>
        );
    }

}

ReactDom.render(<App/>, document.body);