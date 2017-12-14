
import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';

import { CoinType } from './common';
import { DateFormatter, MoneyFormatter } from './formatters';

export interface OrderRowItem {
    date: number;
    type: CoinType;
    unit: number;
    qty: number;
}

interface OrderColum extends ReactDataGrid.Column {
    key: keyof OrderRowItem;
}

const COLUMNS: OrderColum[] = [{
    key: 'date',
    name: 'Date',
    formatter: DateFormatter,
}, {
    key: 'type',
    name: 'Type',
}, {
    key: 'unit',
    name: 'Unit',
    formatter: MoneyFormatter,
}, {
    key: 'qty',
    name: 'Acc. Qty',
}];

export class GridOrder extends React.Component<{
    getter: (index: number) => OrderRowItem;
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