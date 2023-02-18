import * as R from 'ramda'
import React from 'react'
import { Column, TableRowItem } from './index'

interface TableRowsProp<TItem extends TableRowItem> {
    items: TItem[]
    position: number
    startOffset: number
    itemsDisplayCount: number
    getRowClasses: (props: TItem) => string[]
    renderRow: (props: TItem) => (JSX.Element | string)[]
    columns: Column[]
}

const getDisplayItems = <TItem extends TableRowItem>(startOffset: number, itemsDisplayCount: number, items: TItem[]) => 
    R.slice(startOffset, itemsDisplayCount + startOffset, items)

const getClass = <TItem extends TableRowItem>(position: number, index: number, item: TItem, getRowClasses: (props: TItem) => (string|null)[]) =>
    getRowClasses(item)
        .concat([
            position == index ? 'isCurrent' : null,
            item.isSelected ? "isSelected" : null
        ])
        .filter(n => !!n)
        .join(' ')

export const TableRows = <TItem extends TableRowItem>({ renderRow, position, items, itemsDisplayCount, startOffset, columns, getRowClasses }: TableRowsProp<TItem>) => (
    <>
        {getDisplayItems(startOffset, itemsDisplayCount, items)
            .map(n => (
                <tr key={n.index} className={getClass(position, n.index, n, getRowClasses)}>
                    {renderRow(n).map((e, i) => <td className={columns[i].isRightAligned ? "rightAligned" : ""} key={i}>{e}</td>)}
                </tr>))}
    </>
)
