
import {CoinType, fetchJson} from './common';

// https://api.bithumb.com/public/ticker/{currency}
const URL_TICKER = (type: CoinType) => `https://api.bithumb.com/public/ticker/${type}`;

export interface Ticker {
    status: string;
    data: {
        opening_price: string;
        closing_price: string;
        min_price: string;
        max_price: string;
        average_price: string;
        units_traded: string;
        volume_1day: string;
        volume_7day: string;
        buy_price: string;
        sell_price: string;
        date: string;
    };
}

export async function getTicker(types: CoinType[], cb: (ret: Ticker[]) => void) {
    cb(await Promise.all(types.map(t => fetchJson<Ticker>(URL_TICKER(t)))));
    setTimeout(async function() {
        cb(await Promise.all(types.map(t => fetchJson<Ticker>(URL_TICKER(t)))));
    }, 1000);
};
