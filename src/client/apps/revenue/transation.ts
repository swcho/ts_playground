
import {CoinType} from './common';

export type TransactionType = 'BUY' | 'SELL';

export type Won = number;

export interface TransactionItem {
    date: number;
    type: TransactionType;
    kind: CoinType;
    unit: Won;
    qty: number;
    charge: number;
}

const TEST: TransactionItem[] = [
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'BTC',
        unit: 14461000,
        qty: 0.01,
        charge: 0.75,
    },
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'BTC',
        unit: 14600000,
        qty: 0.01,
        charge: 0.75,
    },
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'BTC',
        unit: 14700000,
        qty: 0.01,
        charge: 0.75,
    },
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'BTC',
        unit: 15874000,
        qty: 0.01,
        charge: 0.75,
    },
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'BTC',
        unit: 16044000,
        qty: 0.01,
        charge: 0.75,
    },
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'BTC',
        unit: 16140000,
        qty: 0.05,
        charge: 0.75,
    },
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'BTC',
        unit: 15450000,
        qty: 0.02,
        charge: 0.75,
    },
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'ETH',
        unit: 554000,
        qty: 1,
        charge: 0.75,
    },
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'DASH',
        unit: 921500,
        qty: 0.5,
        charge: 0.75,
    },
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'ETC',
        unit: 34430,
        qty: 5,
        charge: 0.75,
    },
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'ETC',
        unit: 33880,
        qty: 5,
        charge: 0.75,
    },
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'DASH',
        unit: 890000,
        qty: 1,
        charge: 0.75,
    },
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'BTC',
        unit: 17578000,
        qty: 0.01,
        charge: 0.75,
    },
    {
        date: Date.now(),
        type: 'BUY',
        kind: 'BTC',
        unit: 18000000,
        qty: 0.1,
        charge: 0.75,
    },
];

export function getData(): TransactionItem[] {
    return TEST;
}

export function getExpenses(item: TransactionItem) {
    return item.unit * item.qty * (1 + item.charge / 100);
}
