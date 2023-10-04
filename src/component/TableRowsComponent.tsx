import { RefObject } from 'react'
import { MeasureRow } from './MeasureRow'
import { TableRows } from './TableRows'
import { Column } from './index'

interface TableRowsComponentProps<TItem> {
    columns: Column[]
    itemHeight: number
    setItemHeight: (height: number) => void
    setItemsCount: (c1: number| undefined, c2: number) => void
    tableRoot: RefObject<HTMLDivElement>
    items: TItem[]
    getRowClasses: (props: TItem) => string[]
    renderRow: (props: TItem, click: (id: number)=>void) => (JSX.Element | string)[]
    draggable?: boolean
    onDragStart?: (evt: React.DragEvent) => void
    onDrag?: (evt: React.DragEvent) => void
    onDragEnd?: (evt: React.DragEvent)=>void
    position: number
    startOffset: number
    itemsDisplayCount: number
    click: (id: number)=>void
}

export const TableRowsComponent = <TItem extends object>({ itemHeight, renderRow, items, setItemHeight, setItemsCount, tableRoot,
        itemsDisplayCount, position, startOffset, draggable, onDragStart, onDrag, onDragEnd, columns, getRowClasses, click }: TableRowsComponentProps<TItem>) => 
    itemHeight > 0
    ? TableRows({ items, itemsDisplayCount, position, startOffset, renderRow, draggable, onDragStart, onDrag, onDragEnd, columns, getRowClasses, click })  
    : MeasureRow({items, renderRow, columns, setItemHeight, setItemsCount, tableRoot})
