
import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';

import {CoinType} from './common';
import {MoneyFormatter, MoneySignFormatter, RationSignFormatter} from './formatters';

export interface RevenueRowItem {
    type: CoinType;
    currentUnit: number;
    sellUnit: number;
    expected: number;
    expenses: number;
    incomes: number;
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
    key: 'currentUnit',
    name: 'Unit',
    formatter: MoneyFormatter,
}, {
    key: 'sellUnit',
    name: 'Sell Unit',
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
    key: 'incomes',
    name: 'incomes',
    formatter: MoneyFormatter,
}, {
    key: 'return',
    name: 'Return',
    formatter: MoneySignFormatter,
}, {
    key: 'ratio',
    name: 'Ratio',
    formatter: RationSignFormatter,
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