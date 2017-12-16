
import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';

import { CoinType } from './common';
import { DateFormatter, MoneyFormatter } from './formatters';

export interface OrderRowItem {
    id: string;
    date: number;
    type: CoinType;
    unit: number;
    qty: number;
    btn?: boolean;
    data: any;
}

interface OrderColum extends ReactDataGrid.Column {
    key: keyof OrderRowItem;
}

const COLUMNS: (onCancel: (id: OrderRowItem) => void) => OrderColum[] = (onCancel: (item: OrderRowItem) => void) => [{
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
}, {
    key: 'btn',
    name: 'Cancel',
    formatter: (value) => {
        // console.log(value);
        const {dependentValues} = value;
        return <button onClick={() => onCancel(dependentValues)}>Cancel</button>;
    },
    getRowMetaData: (row) => row
}];

export class GridOrder extends React.Component<{
    getter: (index: number) => OrderRowItem;
    count: number;
    onCancel: (id: OrderRowItem) => void;
}, {}> {
    render() {
        const {
            getter,
            count,
            onCancel,
        } = this.props;
        return (
            <ReactDataGrid
                columns={COLUMNS(onCancel)}
                rowGetter={getter}
                rowsCount={count}
            />
        );
    }
}