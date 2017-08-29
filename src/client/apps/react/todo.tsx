
import * as React from 'react';
import styled from 'styled-components';
import {TransitionMotion, TransitionStyle, spring, presets} from 'react-motion';

interface Item {
    key?: string;
    text: string;
}

const ITEMS: Item[] = [
    {
        text: 'a',
    },
    {
        text: 'b',
    },
    {
        text: 'c',
    },
    {
        text: 'd',
    },
    {
        text: 'e',
    },
    {
        text: 'f',
    },
];

class Todo extends React.Component<{
    className?: string;
}, {
    filter: string;
    items: Item[];
}> {

    constructor(props) {
        super(props);
        this.state = {
            filter: '',
            items: ITEMS.slice(0),
        };
    }

    render() {
        const {
            className
        } = this.props;
        const {
            filter,
            items
        } = this.state;
        return (
            <div className={className}>
                <h1>Todo</h1>
                <div className='container'>
                <input type='text'
                value={filter}
                onChange={
                    (e) => {
                        const filter = e.target.value;
                        this.setState({
                            filter,
                            items: ITEMS.filter(item => filter ? item.text.indexOf(filter) !== -1 : true)
                        });
                    }
                }/>
                    <TransitionMotion
                        defaultStyles={items.map(item => ({
                            key: item.text,
                            style: {
                                height: 0,
                                opacity: 1,
                            }
                        }))}
                        willEnter={(styleThatLeft: TransitionStyle) => ({height: 0, opacity: 1})}
                        willLeave={(styleThatLeft: TransitionStyle) => ({height: spring(0), opacity: spring(0)})}
                        styles={
                            items.map(item => ({
                                key: item.text,
                                style: {
                                    height: spring(30, presets.gentle),
                                    opacity: spring(1, presets.gentle),
                                }
                            }))
                        }
                    >
                    {
                        interpolatedStyles => (
                            <ul>
                                {
                                    interpolatedStyles.map((config, i) => {
                                        return <li key={i} style={{...config.style, border: '1px solid'}}/>;
                                    })
                                }
                            </ul>
                        )
                    }
                    </TransitionMotion>
                    {items.map((item, i) => {
                        return (
                            <li key={i}>{item.text}</li>
                        );
                    })}
                </div>
            </div>
        );
    }
}

export const StyledTodo = styled(Todo)`
    h1 {
        width: 100%;
        font-size: 100px;
        font-weight: 100;
        text-align: center;
        color: rgba(175, 47, 47, 0.15);
    }
    input {
        width: 100%;
        height: 30px;
    }
    .container {
        min-width: 230px;
        max-width: 550px;
        margin: 0 auto;
    }
`;