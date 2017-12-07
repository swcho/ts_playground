
import * as React from 'react';
import {formatMoney} from './common';

export class DateFormatter extends React.Component<{
    value: number;
}, {}> {
    render() {
        const {
            value,
        } = this.props;
        return (
            <span>
                {new Date(value) + ''}
            </span>
        );
    }
}

export class MoneyFormatter extends React.Component<{
    value: number;
}, {}> {
    render() {
        const {
            value,
        } = this.props;
        return (
            <div className='money'>
            {formatMoney(value, 0)}
            </div>
        );
    }
}
