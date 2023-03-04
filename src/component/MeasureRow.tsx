import React, { RefObject, useRef } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { Column } from '.'

interface MeasureRowProp<TItem> {
    items: TItem[]
    columns: Column[]
    setItemHeight: (height: number) => void
    setItemsCount: (c1: number| undefined, c2: number) => void
    tableRoot: RefObject<HTMLDivElement>
    renderRow: (props: TItem) => (JSX.Element | string)[]
}

export const MeasureRow = <TItem extends object>({items, columns, renderRow, setItemHeight, setItemsCount, tableRoot}: MeasureRowProp<TItem>) => {
    const tr = useRef<HTMLTableRowElement>(null)

    useResizeObserver(tr, e => {
        if (e.contentBoxSize[0].blockSize > 5) {
            setItemHeight(e.contentBoxSize[0].blockSize)
            setItemsCount(tableRoot.current?.clientHeight, e.contentBoxSize[0].blockSize)
        }
    })

    return (
            <tr ref={tr}> 
            {
                items.length > 0
                ? renderRow(items[0]).map((e, i) => <td key={i}>{e}</td>)
                : null
            }
            </tr>
        )
}
