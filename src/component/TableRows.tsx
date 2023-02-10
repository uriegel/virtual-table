import * as R from 'ramda'
import React from 'react'
import { TableRowItem } from './index'

interface TableRowsProp {
    items: TableRowItem[]
    position: Number
    startOffset: number
    itemsDisplayCount: number
    renderRow: (props: TableRowItem)=>JSX.Element
}

const getDisplayItems = (startOffset: number, itemsDisplayCount: number, items: TableRowItem[]) => 
    R.slice(startOffset, itemsDisplayCount + startOffset, items)

export const TableRows = ({ renderRow, position, items, itemsDisplayCount, startOffset  }: TableRowsProp) => (
    <>
        {getDisplayItems(startOffset, itemsDisplayCount, items)
            .map(n => (
                <tr key={n.index.toString()} className={position == n.index ? 'selected' : ''}>
                    {renderRow(n)} 
                </tr>))}
    </>
)
