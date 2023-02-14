import * as R from 'ramda'
import React from 'react'
import { Column, TableRowItem } from './index'

interface TableRowsProp {
    items: TableRowItem[]
    position: number
    startOffset: number
    itemsDisplayCount: number
    getRowClasses: (props: TableRowItem) => string[]
    renderRow: (props: TableRowItem) => (JSX.Element | string)[]
    columns: Column[]
}

const getDisplayItems = (startOffset: number, itemsDisplayCount: number, items: TableRowItem[]) => 
    R.slice(startOffset, itemsDisplayCount + startOffset, items)

const getClass = (position: number, index: number, item: TableRowItem, getRowClasses: (props: TableRowItem) => (string|null)[]) =>
    getRowClasses(item)
        .concat([
            position == index ? 'isCurrent' : null,
            item.isSelected ? "isSelected" : null
        ])
        .filter(n => !!n)
        .join(' ')

export const TableRows = ({ renderRow, position, items, itemsDisplayCount, startOffset, columns, getRowClasses }: TableRowsProp) => (
    <>
        {getDisplayItems(startOffset, itemsDisplayCount, items)
            .map(n => (
                <tr key={n.index} className={getClass(position, n.index, n, getRowClasses)}>
                    {renderRow(n).map((e, i) => <td className={columns[i].isRightAligned ? "rightAligned" : ""} key={i}>{e}</td>)}
                </tr>))}
    </>
)
