
import {CoinType} from './common';

export type TransactionOrder = 'BUY' | 'SELL';

export type Won = number;

export interface TransactionItem {
    date: number;
    order: TransactionOrder;
    type: CoinType;
    unit: Won;
    qty: number;
    charge: number;
}

const TEST: TransactionItem[] = [
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 14461000,
        qty: 0.01,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 14600000,
        qty: 0.01,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 14700000,
        qty: 0.01,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 15874000,
        qty: 0.01,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 16044000,
        qty: 0.01,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 16140000,
        qty: 0.05,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 15450000,
        qty: 0.02,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'ETH',
        unit: 554000,
        qty: 1,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'DASH',
        unit: 921500,
        qty: 0.5,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'ETC',
        unit: 34430,
        qty: 5,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'ETC',
        unit: 33880,
        qty: 5,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'DASH',
        unit: 890000,
        qty: 1,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 17578000,
        qty: 0.01,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 18000000,
        qty: 0.1,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 18294000,
        qty: 0.02,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'SELL',
        type: 'DASH',
        unit: 865700,
        qty: 0.5,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'SELL',
        type: 'DASH',
        unit: 870000,
        qty: 0.5,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'SELL',
        type: 'DASH',
        unit: 880000,
        qty: 0.5,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'SELL',
        type: 'BTC',
        unit: 19380000,
        qty: 0.25,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 24740000,
        qty: 0.074,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 22450000,
        qty: 0.1,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'SELL',
        type: 'BTC',
        unit: 19725000,
        qty: 0.174,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 18000000,
        qty: 0.01,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'SELL',
        type: 'BTC',
        unit: 16628000,
        qty: 0.01,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 18000000,
        qty: 0.001,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'BUY',
        type: 'BTC',
        unit: 14940000,
        qty: 0.2,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'SELL',
        type: 'BTC',
        unit: 17122000,
        qty: 0.2,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'SELL',
        type: 'ETH',
        unit: 518000,
        qty: 1,
        charge: 0.00075,
    },
    {
        date: Date.now(),
        order: 'SELL',
        type: 'ETC',
        unit: 30200,
        qty: 10,
        charge: 0.00075,
    },
];

export function getData(): TransactionItem[] {
    return TEST;
}

export function getExpense(item: TransactionItem) {
    return item.unit * item.qty * (1 + item.charge);
}

export function getIncome(item: TransactionItem) {
    return item.unit * item.qty * (1 - item.charge);
}
