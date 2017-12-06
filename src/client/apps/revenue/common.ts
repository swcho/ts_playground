
import 'isomorphic-fetch';

export type CoinType =
    'BTC' |
    'BCH' |
    'LTC' |
    'ETH' |
    'ETC' |
    'DASH';

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
