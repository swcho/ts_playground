
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import * as React from 'react';
import * as ReactDom from 'react-dom';
// import {HashRouter} from 'react-router-dom';
import * as ReactDataGrid from 'react-data-grid';
import {CoinType} from './common';
import {DateFormatter, MoneyFormatter} from './formatters';
import {TransactionItem, getData} from './transation';
import {getTicker, Ticker} from './bithumb';
import {Revenue} from './revenue';

const data = getData();

interface TransactionRowItem extends TransactionItem {
    expenses: number;
}

interface TransactionColum extends ReactDataGrid.Column {
    key: keyof TransactionRowItem;
}

const COLUMNS: TransactionColum[] = [{
    key: 'date',
    name: '날짜',
    formatter: DateFormatter,
}, {
    key: 'type',
    name: '거래',
}, {
    key: 'kind',
    name: '종류',
}, {
    key: 'unit',
    name: '단가',
    formatter: MoneyFormatter,
}, {
    key: 'qty',
    name: '수량',
}, {
    key: 'charge',
    name: '수수료',
}, {
    key: 'expenses',
    name: '합',
    formatter: MoneyFormatter,
}];


function getExpenses(item: TransactionItem) {
    return item.unit * item.qty * (1 + item.charge / 100);
}

function rowGetter(rowIndex: number): TransactionRowItem {
    const item = data[rowIndex];
    return {
        ...item,
        expenses: getExpenses(item),
    };
}

function rowLength() {
    return data.length;
}

const sums: {[type in CoinType]?: {qty: number; expenses: number}} = data.reduce(function(ret, d) {
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
console.log(sums);

const types = Array.from(new Set(data.map(d => d.kind)));

data.forEach(function(d) {
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
        return (
            <div>
                <ReactDataGrid
                    columns={COLUMNS}
                    rowGetter={rowGetter}
                    rowsCount={rowLength()}
                />
                <Revenue
                    getter={(index) => {
                        const item = tickerItems[index];
                        const sum = sums[item.type];
                        const current = parseInt(item.ticker.data.closing_price);
                        const sell_price = current * sum.qty;
                        return {
                            type: item.type,
                            current,
                            expected: sell_price,
                            total: sum.expenses,
                            return: sell_price - sum.expenses,
                        };
                    }}
                    count={tickerItems.length}
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