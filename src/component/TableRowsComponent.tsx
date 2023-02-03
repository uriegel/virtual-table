import { RefObject } from 'react'
import { MeasureRow } from './MeasureRow'
import { TableRows } from './TableRows'
import { TableRowProp } from './VirtualTable'

interface TableRowsComponentProps {
    itemHeight: number
    setItemHeight: (height: number) => void
    setItemsCount: (c1: number| undefined, c2: number) => void
    tableRoot: RefObject<HTMLDivElement>
    renderRow: (props: TableRowProp) => JSX.Element
    position: Number
    startOffset: number
    itemsDisplayCount: number
    count: number
}

export const TableRowsComponent = ({ itemHeight, renderRow,
    setItemHeight, setItemsCount, tableRoot, count, itemsDisplayCount, position, startOffset }: TableRowsComponentProps) => 
    itemHeight > 0
    ? TableRows({ count, itemsDisplayCount, position, startOffset, renderRow })  
    : MeasureRow({renderRow, setItemHeight, setItemsCount, tableRoot})
