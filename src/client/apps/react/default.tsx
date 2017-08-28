
import * as React from 'react';
import {Motion, StaggeredMotion, TransitionMotion, spring, TransitionStyle} from 'react-motion';

export class DefaultMotion extends React.Component<{}, {
    items: {
        key: string;
        size: number;
    }[];
}> {

    constructor(props) {
        super(props);
        this.state = {
            items: [
                {key: 'a', size: 10},
                {key: 'b', size: 20},
                {key: 'c', size: 30},
            ],
        };
        console.log(spring(100));
    }

    render() {
        const {
            items
        } = this.state;
        return (
            <div>
                <Motion
                    defaultStyle={{x: 0}}
                    style={{x: spring(100)}}
                    onRest={() => console.log('onRest')}
                >
                    {value => <h1 style={{transform: `translateX(${value.x}px)`}}>React {value.x}</h1>}
                </Motion>
                <TransitionMotion
                    willLeave={(styleThatLeft: TransitionStyle) => ({width: spring(0), height: spring(0)})}
                    styles={
                        items.map(item => ({
                            key: item.key,
                            style: {
                                width: item.size,
                                height: item.size,
                            }
                        }))
                    }
                >
                {
                    interpolatedStyles => (
                        <div>
                            {
                                interpolatedStyles.map(config => {
                                    return <div key={config.key} style={{...config.style, border: '1px solid'}}/>;
                                })
                            }
                        </div>
                    )
                }
                </TransitionMotion>
                <StaggeredMotion
                    defaultStyles={[
                        {h: 0},
                        {h: 0},
                        {h: 0},
                    ]}
                    styles={
                        prevInterpolatedStyles => prevInterpolatedStyles.map((_, i) => {
                            {/* i === 0
                                ? console.log(_, i)
                                : console.log(prevInterpolatedStyles[i - 1].h); */}
                            return i === 0
                                ? {h: spring(100)}
                                : {h: spring(prevInterpolatedStyles[i - 1].h)};
                        })
                    }
                >
                {
                    interpolatingStyles =>
                        <div>
                            {
                                interpolatingStyles.map((style, i) => (
                                    <div key={i} style={{border: '1px solid', height: style.h}}/>
                                ))
                            }
                        </div>
                }
                </StaggeredMotion>
            </div>
        );
    }

    componentDidMount() {
        this.setState({
            items: [
                {key: 'a', size: 10},
                {key: 'b', size: 20},
                // {key: 'c', size: 30},
            ],
        });
    }
}