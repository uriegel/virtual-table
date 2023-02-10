import { RefObject } from 'react'
import { MeasureRow } from './MeasureRow'
import { TableRows } from './TableRows'
import { Column, TableRowItem } from './index'

interface TableRowsComponentProps {
    columns: Column[]
    itemHeight: number
    setItemHeight: (height: number) => void
    setItemsCount: (c1: number| undefined, c2: number) => void
    tableRoot: RefObject<HTMLDivElement>
    items: TableRowItem[]
    renderRow: (props: TableRowItem) => (JSX.Element|string)[]
    measureRow: () => JSX.Element|string
    position: number
    startOffset: number
    itemsDisplayCount: number
}

export const TableRowsComponent = ({ itemHeight, renderRow, measureRow, items, setItemHeight, setItemsCount,
        tableRoot, itemsDisplayCount, position, startOffset, columns }: TableRowsComponentProps) => 
    itemHeight > 0
    ? TableRows({ items, itemsDisplayCount, position, startOffset, renderRow, columns })  
    : MeasureRow({measureRow, setItemHeight, setItemsCount, tableRoot})
