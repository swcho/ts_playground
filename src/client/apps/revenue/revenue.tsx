
import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';

import {CoinType} from './common';
import {MoneyFormatter} from './formatters';

interface RevenueRowItem {
    type: CoinType;
    current: number;
    expected: number;
    total: number;
    return: number;
    ratio?: number;
}

interface RevenueColum extends ReactDataGrid.Column {
    key: keyof RevenueRowItem;
}

const COLUMNS: RevenueColum[] = [{
    key: 'type',
    name: '종류',
}, {
    key: 'current',
    name: '시세',
    formatter: MoneyFormatter,
}, {
    key: 'expected',
    name: '예상입금',
    formatter: MoneyFormatter,
}, {
    key: 'total',
    name: '투자금액',
    formatter: MoneyFormatter,
}, {
    key: 'return',
    name: '예상수익',
    formatter: MoneyFormatter,
}, {
    key: 'ratio',
    name: '예상수익률',
}];

export class Revenue extends React.Component<{
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