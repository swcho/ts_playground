
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import * as React from 'react';
import * as ReactDom from 'react-dom';
// import {HashRouter} from 'react-router-dom';
import {CoinType, returnRatio} from './common';
import {getData, getExpenses} from './transation';
import {getTicker, Ticker} from './bithumb';
import {GridTransaction} from './gridtrans';
import {GridRevenue, RevenueRowItem} from './gridrevenue';

const transactions = getData();

const sums: {[type in CoinType]?: {qty: number; expenses: number}} = transactions.reduce(function(ret, d) {
    if (!ret[d.kind]) {
        ret[d.kind] = {
            qty: 0,
            expenses: 0,
        };
    }
    const sum = ret[d.kind];
    sum.qty += d.qty;
    sum.expenses += getExpenses(d);
    return ret;
}, {});

const types = Array.from(new Set(transactions.map(d => d.kind)));

transactions.forEach(function(d) {
});


interface TickerItem {
    type: CoinType;
    ticker: Ticker;
}

class Component extends React.Component<{}, {
    tickerItems: TickerItem[];
}> {

    constructor(props) {
        super(props);
        this.state = {
            tickerItems: [],
        };
    }

    render() {
        const {
            tickerItems,
        } = this.state;
        const revenueItems: RevenueRowItem[] = [];
        let sumExpected = 0;
        let sumExpenses = 0;
        let sumReturn = 0;
        tickerItems.forEach((item) => {
            const sum = sums[item.type];
            const current = parseInt(item.ticker.data.closing_price);
            const sell_price = current * sum.qty;
            const ret = sell_price - sum.expenses;
            sumExpected += sell_price;
            sumExpenses += sum.expenses;
            sumReturn += ret;
            revenueItems.push({
                type: item.type,
                current,
                expected: sell_price,
                expenses: sum.expenses,
                return: ret,
                ratio: returnRatio(sum.expenses, sell_price),
            });
        });
        revenueItems.push({
            type: 'ALL',
            current: 0,
            expected: sumExpected,
            expenses: sumExpenses,
            return: sumReturn,
            ratio: returnRatio(sumExpenses, sumExpected),
        });
        return (
            <div>
                <GridTransaction
                    transactions={transactions}
                />
                <GridRevenue
                    getter={(index) => revenueItems[index]}
                    count={tickerItems.length + 1}
                />
            </div>
        );
    }

    componentDidMount() {
        getTicker(types, (tickers) => {
            console.log(tickers);
            const tickerItems = types.map((type, i) => ({type, ticker: tickers[i]}));
            this.setState({tickerItems});
        });
    }
}

ReactDom.render(<Component/>, document.getElementById('react-app'));