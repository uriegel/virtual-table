import React, { KeyboardEvent, useRef, useState } from 'react'
import './VirtualTable.css'
import * as R from'ramda'
import useResizeObserver from '@react-hook/resize-observer'

export interface TableRowProp {
    index: Number
}

interface VirtualTableProp {
    count: number
    state: VirtualTableState
    renderRow: (props: TableRowProp)=>JSX.Element
}

interface VirtualTableState {
    position: number,
    setPosition: (pos: number)=>void
}

export const useVirtualTableState = () => {
    const [position, setPosition] = useState(0)
    return {
        position, setPosition 
    } as VirtualTableState
}

const VirtualTable = ({ count, renderRow, state }: VirtualTableProp) => {
    
    const tableRoot = useRef<HTMLDivElement>(null)

    const [itemHeight, setItemHeight] = useState(0)
    const [startOffset, setStartOffset] = useState(0)
    const [itemsDisplayCount, setItemsDisplayCount] = useState(100)

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        console.log("Hallo", e)
        switch (e.code) {
            case "ArrowDown":
                state.setPosition(Math.min(count - 1, state.position + 1))
                e.preventDefault()
                e.stopPropagation()
                break
            case "ArrowUp":
                state.setPosition(Math.max(0, state.position - 1))
                e.preventDefault()
                e.stopPropagation()
                break
        }
    }

    useResizeObserver(tableRoot, e => console.log("Resize", e.contentBoxSize[0]))

    const getDisplayItems = () => 
        R.slice(startOffset, itemsDisplayCount-startOffset, [...Array(count).keys()])
    
    
    const TableRowsComponent = () => 
        itemHeight > 0
        ? TableRows()  
        : MeasureRow()
    
    const TableRows = () => (
        <>
            {getDisplayItems()
                .map(n => (
                    <tr key={n} className={state.position == n ? 'selected' : ''}>
                        {renderRow({ index: n })} 
                    </tr>))}
        </>
    )

    const MeasureRow = () => {
        const tr = useRef<HTMLTableRowElement>(null)

        useResizeObserver(tr, e => {
            console.log("Resize tr", e.contentBoxSize[0], tableRoot.current?.clientHeight)
            setItemHeight(e.contentBoxSize[0].blockSize)
        })
//        if (itemsDisplayCount.length > 0)
        return (
            <tr ref={tr}>
                {renderRow({ index: 0 })}
            </tr>
        )
    }

    console.log("Rendering Virtual Table")
    return (
            <div className="vtr__tableroot" ref={tableRoot} tabIndex={0} onKeyDown={onKeyDown}>
                <table>
                    <thead>
                    </thead>
                    <tbody>
                        <TableRowsComponent />
                    </tbody>
                </table>
            </div>
    )
}

export default VirtualTable

// TODO Adapt table item count after measuring
