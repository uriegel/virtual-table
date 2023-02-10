import React, { RefObject, useRef } from 'react'
import useResizeObserver from '@react-hook/resize-observer'

interface MeasureRowProp {
    setItemHeight: (height: number) => void
    setItemsCount: (c1: number| undefined, c2: number) => void
    tableRoot: RefObject<HTMLDivElement>
    measureRow: ()=>JSX.Element|string
}

export const MeasureRow = ({measureRow, setItemHeight, setItemsCount, tableRoot}: MeasureRowProp) => {
    const tr = useRef<HTMLTableRowElement>(null)

    useResizeObserver(tr, e => {
        if (e.contentBoxSize[0].blockSize > 0) {
            setItemHeight(e.contentBoxSize[0].blockSize)
            setItemsCount(tableRoot.current?.clientHeight, e.contentBoxSize[0].blockSize)
        }
    })

    return (
        <tr ref={tr}>
            <td>{measureRow()}</td>
        </tr>
    )
}
