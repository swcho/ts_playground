
import * as React from 'react';
import styled from 'styled-components';
import {StaggeredMotion, spring} from 'react-motion';

interface HeadInfo {
    url: string;
}

const HEAD_INFOS: HeadInfo[] = [
    {
        url: require('!file-loader!./0.jpg'),
    },
    {
        url: require('!file-loader!./1.jpg'),
    },
    {
        url: require('!file-loader!./2.jpg'),
    },
    {
        url: require('!file-loader!./3.jpg'),
    },
    {
        url: require('!file-loader!./4.jpg'),
    },
    {
        url: require('!file-loader!./5.jpg'),
    },
];

interface HeadProps {
    url: string;
}

const Area = styled.div`
    position: relative;
    width: 100vw;
    height: 80vh;
`;

const Head = styled.div`
    border-radius: 99px;
    background-color: white;
    width: 50px;
    height: 50px;
    border: 3px solid white;
    position: absolute;
    background-size: 50px;
    background-image: url(${(props: HeadProps) => props.url});
`;

export class ChatHeads extends React.Component<{}, {
    pos: {x: number; y: number; }
    headInfos: HeadInfo[];
}> {

    constructor(props) {
        super(props);
        this.state = {
            pos: {
                x: 0, y: 0,
            },
            headInfos: HEAD_INFOS,
        };
    }

    render() {
        const {
            pos,
            headInfos,
        } = this.state;
        return (
            <Area onMouseMove={
                (e) => {
                    const {
                        clientX,
                        clientY,
                    } = e;
                    this.setState({
                        pos: {
                            x: clientX,
                            y: clientY,
                        }
                    });
                }
            }>
                <span>x: {pos.x}, y: {pos.y}</span>
                {
                    headInfos.map((head, i) => {
                        return (
                            <Head key={i} url={head.url}>
                            </Head>
                        );
                    })
                }
                <StaggeredMotion
                    defaultStyles={
                        headInfos.map(info => ({
                            left: 0,
                            top: 0,
                        }))
                    }
                    styles={
                        prevInterpolatedStyles => prevInterpolatedStyles.map((_, i) => {
                            return i === 0
                                ? {
                                    left: spring(pos.x),
                                    top: spring(pos.y),
                                }
                                : {
                                    left: spring(prevInterpolatedStyles[i - 1].left),
                                    top: spring(prevInterpolatedStyles[i - 1].top),
                                };
                        })
                    }
                >
                {
                    interpolatingStyles =>
                        <div>
                            {
                                interpolatingStyles.map((style, i) => (
                                    <Head key={i} style={style} url={headInfos[i].url}/>
                                ))
                            }
                        </div>
                }
                </StaggeredMotion>
            </Area>
        );
    }
}