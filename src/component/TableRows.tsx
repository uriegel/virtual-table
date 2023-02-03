import * as R from 'ramda'
import React from 'react'
import { TableRowProp } from './VirtualTable'

interface TableRowsProp {
    position: Number
    startOffset: number
    itemsDisplayCount: number
    count: number
    renderRow: (props: TableRowProp)=>JSX.Element
}

const getDisplayItems = (position: Number, startOffset: number, itemsDisplayCount: number, count: number) => 
    R.slice(startOffset, itemsDisplayCount + startOffset, [...Array(count).keys()])


export const TableRows = ({ renderRow, position, count, itemsDisplayCount, startOffset }: TableRowsProp) => (
    <>
        {getDisplayItems(position, startOffset, itemsDisplayCount, count)
            .map(n => (
                <tr key={n} className={position == n ? 'selected' : ''}>
                    {renderRow({ index: n })} 
                </tr>))}
    </>
)
