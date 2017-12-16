
import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';

import { CoinType } from './common';
import { DateFormatter, MoneyFormatter, RatioFormatter } from './formatters';

export interface OrderRowItem {
    id: string;
    date: number;
    type: CoinType;
    ratio: number;
    unit: number;
    gap: number;
    gapRatio: number;
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
    key: 'ratio',
    name: 'Ratio',
    formatter: RatioFormatter,
}, {
    key: 'unit',
    name: 'Unit',
    formatter: MoneyFormatter,
}, {
    key: 'gap',
    name: 'Gap',
    formatter: MoneyFormatter,
}, {
    key: 'gapRatio',
    name: 'Expected',
    formatter: RatioFormatter,
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