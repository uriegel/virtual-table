import { RefObject } from 'react'
import { MeasureRow } from './MeasureRow'
import { TableRows } from './TableRows'
import { Column, TableRowItem } from './index'

interface TableRowsComponentProps<TItem> {
    columns: Column[]
    itemHeight: number
    setItemHeight: (height: number) => void
    setItemsCount: (c1: number| undefined, c2: number) => void
    tableRoot: RefObject<HTMLDivElement>
    items: TItem[]
    getRowClasses: (props: TItem) => string[]
    renderRow: (props: TItem) => (JSX.Element|string)[]
    measureRow: () => JSX.Element|string
    position: number
    startOffset: number
    itemsDisplayCount: number
}

export const TableRowsComponent = <TItem extends TableRowItem>({ itemHeight, renderRow, measureRow, items, setItemHeight, setItemsCount,
        tableRoot, itemsDisplayCount, position, startOffset, columns, getRowClasses }: TableRowsComponentProps<TItem>) => 
    itemHeight > 0
    ? TableRows({ items, itemsDisplayCount, position, startOffset, renderRow, columns, getRowClasses })  
    : MeasureRow({measureRow, setItemHeight, setItemsCount, tableRoot})
