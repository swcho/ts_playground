
import * as React from 'react';

import {CoinType, COINS, formatMoney, parseMoney, TickerItemMap} from './common';
import {placeBuyOrder} from './bithumb';

export class InputBuy extends React.Component<{
    coin: CoinType;
    unit: number;
    qty: string;
    tickerItemMap: TickerItemMap;
    onCoinChange: (coin: CoinType) => void,
}, {}> {
    render() {
        const {
            tickerItemMap,
            coin,
            unit,
            qty,
        } = this.props;

        return (
            <div>
                <select
                    className='right' name='order-coin'
                    value={coin}
                    onChange={
                        (e) => {
                            // this.setState({buyType: e.target.value as any});
                            const coin = e.target.value as CoinType;
                            const ticker = tickerItemMap[coin];
                            this.setState({
                                buyType: coin,
                                buyUnit: ticker.close,
                                buyQty: '0',
                            });
                        }
                    }
                >
                    <option value={null}>-</option>
                    {COINS.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
                <label htmlFor='buy-unit'>Unit: </label>
                <input
                    id='buy-unit'
                    type='text'
                    value={formatMoney(unit, 0)}
                    onChange={(e) => this.setState({buyUnit: parseMoney(e.target.value)})}
                />
                <label htmlFor='buy-qty'>QTY: </label>
                <input
                    type='text'
                    value={qty}
                    onChange={(e) => this.setState({buyQty: e.target.value})}
                />
                Total: {formatMoney(unit * parseFloat(qty), 0)}
                <button
                    onClick={
                        () => {
                            if (confirm(`${coin} ${unit} ${qty}`)) {
                                placeBuyOrder(coin, unit, parseFloat(qty));
                            }
                        }
                    }
                >
                    BUY
                </button>
            </div>

        );
    }
}