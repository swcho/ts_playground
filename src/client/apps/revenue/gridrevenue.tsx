
import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';

import {CoinType} from './common';
import {MoneyFormatter} from './formatters';

interface RevenueRowItem {
    type: CoinType;
    current: number;
    expected: number;
    expenses: number;
    return: number;
    ratio?: number;
}

interface RevenueColum extends ReactDataGrid.Column {
    key: keyof RevenueRowItem;
}

const COLUMNS: RevenueColum[] = [{
    key: 'type',
    name: 'Type',
}, {
    key: 'current',
    name: 'Current',
    formatter: MoneyFormatter,
}, {
    key: 'expected',
    name: 'Expected',
    formatter: MoneyFormatter,
}, {
    key: 'expenses',
    name: 'Expenses',
    formatter: MoneyFormatter,
}, {
    key: 'return',
    name: 'Return',
    formatter: MoneyFormatter,
}, {
    key: 'ratio',
    name: 'Ratio',
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