
import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';

import {CoinType} from './common';
import {MoneyFormatter, MoneySignFormatter, RatioSignFormatter} from './formatters';

export interface RevenueRowItem {
    coin: CoinType;
    ratio: number;
    currentUnit: number;
    avgUnit: number;
    qty: number;
    expenses: number;
    return: number;
    returnRatio: number;
}

interface RevenueColum extends ReactDataGrid.Column {
    key: keyof RevenueRowItem;
}

const COLUMNS: RevenueColum[] = [{
    key: 'coin',
    name: 'Coin',
}, {
    key: 'ratio',
    name: 'Ratio',
    formatter: RatioSignFormatter,
}, {
    key: 'currentUnit',
    name: 'Unit',
    formatter: MoneyFormatter,
}, {
    key: 'avgUnit',
    name: 'Avg. Unit',
    formatter: MoneyFormatter,
}, {
    key: 'qty',
    name: 'Acc. Qty',
}, {
    key: 'expenses',
    name: 'Acc. Exp',
    formatter: MoneySignFormatter,
}, {
    key: 'return',
    name: 'Return',
    formatter: MoneySignFormatter,
}, {
    key: 'returnRatio',
    name: 'Return %',
    formatter: RatioSignFormatter,
}];

export class GridRevenue extends React.Component<{
    getter: (index: number) => RevenueRowItem;
    count: number;
}, {}> {
    render() {
        const {
            getter,
            count,
        } = this.props;
        return (
            <ReactDataGrid
                columns={COLUMNS}
                rowGetter={getter}
                rowsCount={count}
            />
        );
    }
}