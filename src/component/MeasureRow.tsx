import React, { RefObject, useRef } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { TableRowProp } from './index'

interface MeasureRowProp {
    setItemHeight: (height: number) => void
    setItemsCount: (c1: number| undefined, c2: number) => void
    tableRoot: RefObject<HTMLDivElement>
    renderRow: (props: TableRowProp)=>JSX.Element
}

export const MeasureRow = ({renderRow, setItemHeight, setItemsCount, tableRoot}: MeasureRowProp) => {
    const tr = useRef<HTMLTableRowElement>(null)

    useResizeObserver(tr, e => {
        if (e.contentBoxSize[0].blockSize > 0) {
            setItemHeight(e.contentBoxSize[0].blockSize)
            setItemsCount(tableRoot.current?.clientHeight, e.contentBoxSize[0].blockSize)
        }
    })
//        if (itemsDisplayCount.length > 0)
    return (
        <tr ref={tr}>
            {renderRow({ index: 0, col: 0 })}
        </tr>
    )
}
