
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

export function getExpense(item: TransactionItem) {
    return item.unit * item.qty * (1 + item.charge);
}

export function getIncome(item: TransactionItem) {
    return item.unit * item.qty * (1 - item.charge);
}
