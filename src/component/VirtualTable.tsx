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

    useResizeObserver(tableRoot, e => {
        console.log("Resize")
        retrieveItemsCount(e.contentBoxSize[0].blockSize, itemHeight)
    })

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

    const retrieveItemsCount = (clientHeight: number|undefined, itemsHeight: number) => 
        setItemsDisplayCount(Math.floor((clientHeight ?? 0) / itemsHeight) + 1) 

    const MeasureRow = () => {
        const tr = useRef<HTMLTableRowElement>(null)

        useResizeObserver(tr, e => {
            if (e.contentBoxSize[0].blockSize > 0) {
                setItemHeight(e.contentBoxSize[0].blockSize)
                retrieveItemsCount(tableRoot.current?.clientHeight, e.contentBoxSize[0].blockSize)
            }
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

// TODO Scrolling when changing position
// TODO ScrollIntoView when resizing
// TODO PageUp/PageDown Home/End
// TODO Scrollbar