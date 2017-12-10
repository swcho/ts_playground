
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import * as React from 'react';
import * as ReactDom from 'react-dom';
// import {HashRouter} from 'react-router-dom';
import {CoinType, returnRatio} from './common';
import {getData, getExpense, getIncome} from './transation';
import {getTicker, Ticker} from './bithumb';
import {GridTransaction, TransactionRowItem} from './gridtrans';
import {GridRevenue, RevenueRowItem} from './gridrevenue';

const transactions = getData();

const transactionRowItems: TransactionRowItem[] = [];

interface SumTotal {
    qty: number;
    expenses: number;
    accExpenses: number;
    incomes: number;
}

const sums: {[type in CoinType]?: SumTotal} = {};
const prevAvgUnit = 0;
transactions.forEach(function(t, i) {
    let price = 0;
    let ret = 0;
    let retRatio = 0;

    if (!sums[t.type]) {
        sums[t.type] = {
            qty: 0,
            expenses: 0,
            accExpenses: 0,
            incomes: 0,
        };
    }
    const sum = sums[t.type];
    // const prevTotal = prevAvgUnit * (sum.expensesQty - sum.incomesQty);
    if (t.order === 'BUY') {
        price = getExpense(t);
        sum.qty += t.qty;
        sum.expenses += price;
        sum.accExpenses += price;
    } else if (t.order === 'SELL') {
        price = getIncome(t);
        const accExpense = (sum.accExpenses / sum.qty) * t.qty;
        sum.accExpenses -= accExpense;
        sum.qty -= t.qty;
        sum.incomes += price;
        ret = price - accExpense;
        retRatio = (ret) / accExpense;
    }

    // const avgUnit = sum.expenses / (sum.expensesQty - sum.incomesQty);
    transactionRowItems.push({
        ...t,
        price,
        accQty: sum.qty,
        accExpenses: sum.accExpenses,
        return: ret,
        returnRatio: retRatio,
    });

});

const types = Array.from(new Set(transactions.map(d => d.type)));

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
        let sum_sell_price = 0;
        let sum_buy_price = 0;
        let sumReturn = 0;
        tickerItems.forEach((item) => {
            const sum = sums[item.type];
            const currentUnit = parseInt(item.ticker.data.closing_price);
            const qty = sum.qty;
            const sell_price = currentUnit * qty * (1 - 0.00075);
            const buy_price = sum.accExpenses;
            const ret = sell_price - buy_price;
            sum_sell_price += sell_price;
            sum_buy_price += buy_price;
            sumReturn += ret;
            revenueItems.push({
                type: item.type,
                currentUnit,
                avgUnit: sum.accExpenses / qty,
                qty: qty,
                return: ret,
                ratio: returnRatio(buy_price, sell_price),
            });
        });
        revenueItems.push({
            type: 'ALL',
            currentUnit: 0,
            avgUnit: 0,
            qty: 0,
            return: sumReturn,
            ratio: returnRatio(sum_buy_price, sum_sell_price),
        });
        return (
            <div>
                <GridTransaction
                    transactions={transactionRowItems}
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