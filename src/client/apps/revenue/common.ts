
import 'isomorphic-fetch';

export type CoinType =
    'BTC' |
    'BCH' |
    'LTC' |
    'ETH' |
    'ETC' |
    'DASH' |
    'XRP' |
    'QTUM' |
    'EOS' |
    'ZEC' |
    'ALL';

export const COINS: CoinType[] = [
    'BTC',
    'BCH',
    'LTC',
    'ETH',
    'ETC',
    'DASH',
    'XRP',
    'EOS',
    'QTUM',
    'ZEC',
];

export type OrderType = 'BUY' | 'SELL';

export function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    return fetch(url, options)
        // .then((response) => {
        //     console.log(response);
        //     return response;
        // })
        .then((response) => response.text())
        .then(JSON.parse);
}

export function formatMoney(n, c?, d?, t?) {
    c = isNaN(c = Math.abs(c)) ? 2 : c;
    d = d === undefined ? '.' : d;
    t = t === undefined ? ',' : t;
    let s = n < 0 ? '-' : '',
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j;
    j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - parseInt(i)).toFixed(c).slice(2) : '');
}

export function returnRatio(buy: number, sell: number) {
    return (sell - buy) / buy;
}

export function queryToStr(query) {
    let ret = [];
    for (const key in query) {
        const value = query[key];
        const type = typeof value;
        if (type === 'string' || type === 'number') {
            ret.push(key + '=' + encodeURIComponent(query[key]));
        } else if (value instanceof Array) {
            value.forEach((v) => ret.push(key + '=' + encodeURIComponent(v)));
        }
    }
    return ret.join('&');
}

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
