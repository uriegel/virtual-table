import { RefObject } from 'react'
import { MeasureRow } from './MeasureRow'
import { TableRows } from './TableRows'
import { TableRowItem } from './index'

interface TableRowsComponentProps {
    itemHeight: number
    setItemHeight: (height: number) => void
    setItemsCount: (c1: number| undefined, c2: number) => void
    tableRoot: RefObject<HTMLDivElement>
    items: TableRowItem[]
    renderRow: (props: TableRowItem) => (JSX.Element|string)[]
    measureRow: () => JSX.Element|string
    position: Number
    startOffset: number
    itemsDisplayCount: number
}

export const TableRowsComponent = ({ itemHeight, renderRow, measureRow, items, setItemHeight, setItemsCount,
        tableRoot, itemsDisplayCount, position, startOffset }: TableRowsComponentProps) => 
    itemHeight > 0
    ? TableRows({ items, itemsDisplayCount, position, startOffset, renderRow })  
    : MeasureRow({measureRow, setItemHeight, setItemsCount, tableRoot})
