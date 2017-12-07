
import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';
import {DateFormatter, MoneyFormatter, RatioFormatter} from './formatters';
import {TransactionItem, getExpenses} from './transation';

interface TransactionRowItem extends TransactionItem {
    expense: number;
}

interface TransactionColum extends ReactDataGrid.Column {
    key: keyof TransactionRowItem;
}

const COLUMNS: TransactionColum[] = [{
    key: 'date',
    name: 'Date',
    formatter: DateFormatter,
}, {
    key: 'type',
    name: 'Type',
}, {
    key: 'kind',
    name: 'Kind',
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
    key: 'expense',
    name: 'Expense',
    formatter: MoneyFormatter,
}];

export class GridTransaction extends React.Component<{
    transactions: TransactionItem[];
}, {}> {
    render() {
        const {
            transactions,
        } = this.props;
        return (
            <ReactDataGrid
                columns={COLUMNS}
                rowGetter={(index) => {
                    const item = transactions[index];
                    return {
                        ...item,
                        expense: getExpenses(item),
                    };
                }}
                rowsCount={transactions.length}
            />
        );
    }

}