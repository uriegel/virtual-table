import * as R from 'ramda'
import React from 'react'
import { Column, TableRowItem } from './index'

interface TableRowsProp {
    items: TableRowItem[]
    position: number
    startOffset: number
    itemsDisplayCount: number
    renderRow: (props: TableRowItem) => (JSX.Element | string)[]
    columns: Column[]
}

const getDisplayItems = (startOffset: number, itemsDisplayCount: number, items: TableRowItem[]) => 
    R.slice(startOffset, itemsDisplayCount + startOffset, items)

export const TableRows = ({ renderRow, position, items, itemsDisplayCount, startOffset, columns }: TableRowsProp) => (
    <>
        {getDisplayItems(startOffset, itemsDisplayCount, items)
            .map(n => (
                <tr key={n.index} className={position == n.index ? 'isCurrent' : ''}>
                    {renderRow(n).map((e, i) => <td className={columns[i].isRightAligned ? "rightAligned" : ""} key={i}>{e}</td>)}
                </tr>))}
    </>
)
