
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);
import * as React from 'react';
import * as ReactDom from 'react-dom';
// import {HashRouter} from 'react-router-dom';
import {
    CoinType,
    returnRatio,
    ratio,
    COINS,
    getExpense,
    getIncome,
    TickerItemMap,
    OrderItem,
    formatMoney,
    parseMoney,
} from './common';
import {getTicker, TickerResp, saveTransactions, getTransactionItems,
    initTickerWS,
    getOrderInfo,
    cancelOrder,
    placeBuyOrder,
    placeSellOrder,
} from './bithumb';
import {GridTransaction, TransactionRowItem} from './gridtrans';
import {GridRevenue, RevenueRowItem} from './gridrevenue';
import {GridOrder} from './gridorders';

import './style.scss';

const QTY_PRECISION_HELPER = 100000000;

export const disableGetDefaultPropsWarning = () => {
    const warning = 'Warning: getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.';
    const consoleError = console.error.bind(console);

    console.error = (...args) => {
        if (args[0] === warning) return;
        return consoleError(...args);
    };
};

disableGetDefaultPropsWarning();

(async function () {


    // const bithumbBTC = await getUserTransactions();
    // localStorage.setItem('bithumb_transactions', JSON.stringify(bithumbBTC));

    // const bithumbBTC = JSON.parse(localStorage.getItem('bithumb_transactions')) as UserTransaction[];

    // const transactions = bithumbBTC
    //     .filter(t => t.search === '1' || t.search === '2')
    //     .map(t => {
    //         const ret: TransactionItem = {
    //             date: parseInt(t.transfer_date) / 1000,
    //             order: t.search === '1' ? 'BUY' : 'SELL',
    //             type: 'BTC',
    //             unit: parseInt(t.btc1krw),
    //             qty: Math.abs(parseFloat(t.units.slice(2))),
    //             charge: 0,
    //         };
    //         return ret;
    //     })
    //     .sort((a, b) => b.date - a.date);

    const transactions = getTransactionItems();
    // const transactions = getData();
    // console.log(transactions);

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

        if (!sums[t.coin]) {
            sums[t.coin] = {
                qty: 0,
                expenses: 0,
                accExpenses: 0,
                incomes: 0,
            };
        }
        const sum = sums[t.coin];
        // const prevTotal = prevAvgUnit * (sum.expensesQty - sum.incomesQty);
        if (t.order === 'BUY') {
            price = getExpense(t);
            sum.qty = Math.round(sum.qty * QTY_PRECISION_HELPER + t.qty * QTY_PRECISION_HELPER) / QTY_PRECISION_HELPER;
            sum.expenses += price;
            sum.accExpenses += price;
        } else if (t.order === 'SELL') {
            price = getIncome(t);
            const accExpense = (sum.accExpenses / sum.qty) * t.qty;
            sum.accExpenses -= accExpense;
            sum.qty = Math.round(sum.qty * QTY_PRECISION_HELPER - t.qty * QTY_PRECISION_HELPER) / QTY_PRECISION_HELPER;
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
    console.log(sums);

    const coins = Array.from(new Set(transactions.map(d => d.coin))).sort();

    console.log('coins', coins);

    interface TickerItem {
        type: CoinType;
        ticker: TickerResp;
    }

    class Component extends React.Component<{}, {
        filter: string;
        tickerItems: TickerItem[];
        tickerId: number;
        tickerItemMap: TickerItemMap;
        orders: OrderItem[];
        buyType: CoinType;
        buyUnit: string;
        buyQty: string;
        sellType: CoinType;
        sellUnit: number;
        sellQty: string;
    }> {

        constructor(props) {
            super(props);
            this.state = {
                filter: 'ALL',
                tickerItems: [],
                tickerId: null,
                tickerItemMap: null,
                orders: null,
                buyType: 'BTC',
                buyUnit: '0',
                buyQty: '0',
                sellType: 'ALL',
                sellUnit: 0,
                sellQty: '0',
            };
        }

        render() {
            const {
                filter,
                tickerItems,
                tickerId,
                tickerItemMap,
                orders,
                buyType,
                buyUnit,
                buyQty,
                sellType,
                sellUnit,
                sellQty,
            } = this.state;
            const revenueItems: RevenueRowItem[] = [];
            let sum_sell_price = 0;
            let sum_buy_price = 0;
            let sumReturn = 0;

            if (tickerItemMap) {
                coins.forEach(coin => {
                    const ticker = tickerItemMap[coin];
                    if (!ticker) {
                        console.error(coin, 'has no ticker');
                        return;
                    }
                    const sum = sums[coin];
                    const currentUnit = ticker.close;
                    const qty = sum.qty;
                    const sell_price = currentUnit * qty * (1 - 0.00075);
                    const buy_price = sum.accExpenses;
                    const ret = sell_price - buy_price;
                    sum_sell_price += sell_price;
                    sum_buy_price += buy_price;
                    sumReturn += ret;
                    revenueItems.push({
                        coin,
                        ratio: ratio(ticker.open, currentUnit),
                        currentUnit,
                        avgUnit: sum.accExpenses / qty,
                        qty: qty,
                        expenses: sum.accExpenses,
                        return: ret,
                        returnRatio: returnRatio(buy_price, sell_price),
                    });
                });
            }

            // tickerItems.forEach((item) => {
            //     const sum = sums[item.type];
            //     const currentUnit = parseInt(item.ticker.data.closing_price);
            //     const qty = sum.qty;
            //     const sell_price = currentUnit * qty * (1 - 0.00075);
            //     const buy_price = sum.accExpenses;
            //     const ret = sell_price - buy_price;
            //     sum_sell_price += sell_price;
            //     sum_buy_price += buy_price;
            //     sumReturn += ret;
            //     revenueItems.push({
            //         type: item.type,
            //         currentUnit,
            //         avgUnit: sum.accExpenses / qty,
            //         qty: qty,
            //         return: ret,
            //         ratio: returnRatio(buy_price, sell_price),
            //     });
            // });
            revenueItems.push({
                coin: 'ALL',
                ratio: 0,
                currentUnit: 0,
                avgUnit: 0,
                qty: 0,
                expenses: sum_buy_price,
                return: sumReturn,
                returnRatio: returnRatio(sum_buy_price, sum_sell_price),
            });

            let buyTotal = 0;
            const orderItems = orders ? orders.map(o => {
                    const ticker = tickerItemMap && tickerItemMap[o.coin];
                    const open = ticker ? ticker.open : 0;
                    const current = ticker ? ticker.close : 0;
                    const ratio = (current - open) / open;
                    const ratioExpected = (o.unit - open) / open;
                    const price = o.unit * o.qty;
                    if (o.order === 'BUY') {
                        buyTotal += price;
                    }
                    return {
                        id: o.id,
                        date: o.date,
                        coin: o.coin,
                        order: o.order,
                        unit: o.unit,
                        gap: current - o.unit,
                        ratio: ratioExpected,
                        gapRatio: ratio - ratioExpected,
                        qty: o.qty,
                        price,
                        data: o,
                    };
                }
            ) : [];

            orderItems.push({
                id: null,
                date: null,
                coin: 'ALL',
                order: 'BUY',
                unit: 0,
                gap: 0,
                ratio: 0,
                gapRatio: 0,
                qty: 0,
                price: buyTotal,
                data: null,
            });

            return (
                <div>
                    {/* <div className='ticker-control'>
                        <button onClick={() => {
                            if (tickerId) {
                                this.stopTikcer();
                            } else {
                                this.getTicker(true);
                            }
                        }}>{tickerId ? 'Stop' : 'Auto'}</button>
                    </div> */}
                    <GridRevenue
                        getter={(i) => revenueItems[i]}
                        count={revenueItems.length}
                    />
                    {orders &&
                    <GridOrder
                        getter={(i) => orderItems[i]}
                        count={orderItems.length}
                        onCancel={(item) => {
                            if (confirm(`${item.coin} ${item.unit} ${item.qty}`)) {
                                cancelOrder(item.data);
                            }
                        }}
                    />
                    }
                    <button>Update Orders</button>
                    <div className='order-input'>
                        <select
                            className='right' name='order-coin'
                            value={buyType}
                            onChange={(e) => this.setState({buyType: e.target.value as any})}
                        >
                            {COINS.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <input
                            type='text'
                            value={buyUnit}
                            onChange={(e) => this.setState({buyUnit: e.target.value})}
                        />
                        <input
                            type='text'
                            value={buyQty}
                            onChange={(e) => this.setState({buyQty: e.target.value})}
                        />
                        <button
                            onClick={
                                () => {
                                    if (confirm(`${buyType} ${buyUnit} ${buyQty}`)) {
                                        placeBuyOrder(buyType, parseInt(buyUnit), parseFloat(buyQty));
                                    }
                                }
                            }
                        >
                            BUY
                        </button>
                        <div/>
                        <select
                            className='right' name='sell-coin'
                            value={sellType}
                            onChange={
                                (e) => {
                                    const coin = e.target.value as CoinType;
                                    const ticker = tickerItemMap && tickerItemMap[coin];
                                    const sum = sums[coin];
                                    console.log(ticker);
                                    this.setState({
                                        sellUnit: ticker.close,
                                        sellQty: '' + sum.qty,
                                        sellType: coin as any
                                    });
                                }
                            }
                        >
                            <option value={null}>-</option>
                            {COINS.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <input
                            type='text'
                            value={formatMoney(sellUnit)}
                            onChange={(e) => this.setState({sellUnit: parseMoney(e.target.value)})}
                        />
                        <input
                            type='text'
                            value={sellQty}
                            onChange={(e) => this.setState({sellQty: e.target.value})}
                        />
                        <button
                            onClick={
                                () => {
                                    if (confirm(`${sellType} ${sellUnit} ${sellQty}`)) {
                                        placeSellOrder(sellType, sellUnit, parseFloat(sellQty));
                                    }
                                }
                            }
                        >
                            SELL
                        </button>
                    </div>
                    <GridTransaction
                        transactions={transactionRowItems.filter(item => filter === 'ALL' || item.coin === filter)}
                    />
                    <div className='controls'>
                        <button onClick={() => saveTransactions()}>Update</button>
                        <select className='right' name='filter' id='' value={filter} onChange={(e) => this.setState({filter: e.target.value})}>
                            <option value='ALL'>ALL</option>
                            {coins.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            );
        }

        private getTicker(cont = false) {
            const tickerId = getTicker(coins, cont, (tickers) => {
                const tickerItems = coins.map((type, i) => ({type, ticker: tickers[i]}));
                this.setState({tickerItems});
            });
            this.setState({tickerId});
        }

        private stopTikcer() {
            clearInterval(this.state.tickerId);
            this.setState({tickerId: null});
        }

        async componentDidMount() {
            // this.getTicker();
            initTickerWS((tickerItemMap) => this.setState({tickerItemMap}));

            this.setState({orders: await getOrderInfo()});
        }
    }

    ReactDom.render(<Component/>, document.getElementById('react-app'));

}());