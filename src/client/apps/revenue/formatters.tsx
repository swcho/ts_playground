
import * as React from 'react';
import * as moment from 'moment';
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
                {value ? moment(value).format('YY-MM-DD') : '-'}
            </span>
        );
    }
}

export class MoneyFormatter extends React.Component<{
    value: number;
    useSign: boolean;
}, {}> {
    render() {
        const {
            value,
            useSign
        } = this.props;
        const sign = Math.sign(value);
        const classNames = ['align-right'];
        if (useSign) {
            if (0 < sign) {
                classNames.push('gain');
            } else if (sign < 0) {
                classNames.push('loss');
            }
        }
        return (
            <div className={classNames.join(' ')}>
            {formatMoney(value, 0)}
            </div>
        );
    }
}

export class MoneySignFormatter extends React.Component<{
    value: number;
}, {}> {
    render() {
        return (
            <MoneyFormatter
                value={this.props.value}
                useSign
            />
        );
    }
}

export class RatioFormatter extends React.Component<{
    value: number;
    useSign: boolean;
}, {}> {
    render() {
        const {
            value,
            useSign
        } = this.props;
        const sign = Math.sign(value);
        const classNames = ['align-right'];
        if (useSign) {
            if (0 < sign) {
                classNames.push('gain');
            } else if (sign < 0) {
                classNames.push('loss');
            }
        }
        return (
            <div className={classNames.join(' ')}>
            {Math.round(value * 100000) / 1000}%
            </div>
        );
    }
}

export class RatioSignFormatter extends React.Component<{
    value: number;
}, {}> {
    render() {
        return (
            <RatioFormatter
                value={this.props.value}
                useSign
            />
        );
    }
}
