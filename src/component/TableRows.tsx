import * as R from 'ramda'
import React from 'react'
import { Column, SelectableItem } from './index'

interface TableRowsProp<TItem> {
    items: TItem[]
    position: number
    startOffset: number
    itemsDisplayCount: number
    getRowClasses: (props: TItem) => string[]
    renderRow: (props: TItem) => (JSX.Element | string)[]
    draggable?: boolean
    onDragStart?: (evt: React.DragEvent) => void
    onDrag?: (evt: React.DragEvent) => void
    onDragEnd?: (evt: React.DragEvent)=>void
    columns: Column[]
}

const getDisplayItems = <TItem extends object>(startOffset: number, itemsDisplayCount: number, items: TItem[]) => 
    R.slice(startOffset, itemsDisplayCount + startOffset, items)

const getClass = <TItem extends object>(position: number, index: number, item: TItem, getRowClasses: (props: TItem) => (string|null)[]) =>
    getRowClasses(item)
        .concat([
            position == index ? 'isCurrent' : null,
            (item as SelectableItem)?.isSelected ? "isSelected" : null
        ])
        .filter(n => !!n)
        .join(' ')

export const TableRows = <TItem extends object>({ renderRow, position, items, itemsDisplayCount, startOffset,
    draggable, onDragStart, onDrag, onDragEnd, columns, getRowClasses }: TableRowsProp<TItem>) => (
    <>
        {getDisplayItems(startOffset, itemsDisplayCount, items)
            .map((n, i) => (
                <tr key={i + startOffset} className={getClass(position, i + startOffset, n, getRowClasses)} draggable={draggable}
                        onDragStart={draggable ? onDragStart : undefined} onDrag={draggable ? onDrag : undefined} onDragEnd={draggable ? onDragEnd : undefined}>
                    {renderRow(n).map((e, i) => <td className={columns[i].isRightAligned ? "rightAligned" : ""} key={i}>{e}</td>)}
                </tr>))}
    </>
)
