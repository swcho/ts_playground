
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
    if (!ret[d.type]) {
        ret[d.type] = {
            qty: 0,
            expenses: 0,
        };
    }
    const sum = ret[d.type];
    sum.qty += d.qty;
    sum.expenses += getExpenses(d);
    return ret;
}, {});

const types = Array.from(new Set(transactions.map(d => d.type)));

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
            const currentUnit = parseInt(item.ticker.data.closing_price);
            const sell_price = currentUnit * sum.qty;
            const ret = sell_price - sum.expenses;
            sumExpected += sell_price;
            sumExpenses += sum.expenses;
            sumReturn += ret;
            revenueItems.push({
                type: item.type,
                currentUnit,
                expensesUnit: sum.expenses / sum.qty,
                expected: sell_price,
                expenses: sum.expenses,
                return: ret,
                ratio: returnRatio(sum.expenses, sell_price),
            });
        });
        revenueItems.push({
            type: 'ALL',
            currentUnit: 0,
            expensesUnit: 0,
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