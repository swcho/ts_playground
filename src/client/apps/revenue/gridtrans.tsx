
import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';
import {DateFormatter, MoneyFormatter} from './formatters';
import {TransactionItem, getExpenses} from './transation';

interface TransactionRowItem extends TransactionItem {
    expenses: number;
}

interface TransactionColum extends ReactDataGrid.Column {
    key: keyof TransactionRowItem;
}

const COLUMNS: TransactionColum[] = [{
    key: 'date',
    name: '날짜',
    formatter: DateFormatter,
}, {
    key: 'type',
    name: '거래',
}, {
    key: 'kind',
    name: '종류',
}, {
    key: 'unit',
    name: '단가',
    formatter: MoneyFormatter,
}, {
    key: 'qty',
    name: '수량',
}, {
    key: 'charge',
    name: '수수료',
}, {
    key: 'expenses',
    name: '합',
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
                        expenses: getExpenses(item),
                    };
                }}
                rowsCount={transactions.length}
            />
        );
    }

}