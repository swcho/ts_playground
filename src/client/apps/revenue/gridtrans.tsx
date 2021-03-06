
import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';
import {DateFormatter, MoneyFormatter, RatioFormatter} from './formatters';
import {TransactionItem} from './common';

export interface TransactionRowItem extends TransactionItem {
    price: number;
    accQty: number;
    accExpenses: number;
    return: number;
    returnRatio: number;
}

interface TransactionColum extends ReactDataGrid.Column {
    key: keyof TransactionRowItem;
}

const COLUMNS: TransactionColum[] = [{
    key: 'date',
    name: 'Date',
    formatter: DateFormatter,
}, {
    key: 'order',
    name: 'Order',
}, {
    key: 'coin',
    name: 'Coin',
}, {
    key: 'unit',
    name: 'Unit',
    formatter: MoneyFormatter,
}, {
    key: 'qty',
    name: 'Qty.',
}, {
    key: 'charge',
    name: 'Charge',
    formatter: RatioFormatter
}, {
    key: 'price',
    name: 'Price',
    formatter: MoneyFormatter,
    // formatter: function(props) {
    //     return (
    //         <div/>
    //     );
    // },
    // getRowMetaData: (row) => row
},
{
    key: 'accQty',
    name: 'Acc. Qty',
}, {
    key: 'accExpenses',
    name: 'Acc. Expenses',
    formatter: MoneyFormatter,
},
{
    key: 'return',
    name: 'Return',
    formatter: MoneyFormatter,
}, {
    key: 'returnRatio',
    name: 'Return Ratio',
    formatter: RatioFormatter,
}];

export class GridTransaction extends React.Component<{
    transactions: TransactionRowItem[];
}, {}> {
    render() {
        const {
            transactions,
        } = this.props;
        return (
            <ReactDataGrid
                columns={COLUMNS}
                rowGetter={(index) => transactions[index]}
                rowsCount={transactions.length}
                rowHeight={20}
            />
        );
    }

}