import React, { KeyboardEvent, useRef, useState } from 'react'
import useStateRef from 'react-usestateref'
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
    setPosition: (pos: number) => void
}

export const useVirtualTableState = () => {
    const [position, setPosition] = useState(0)
    return {
        position, setPosition
    } as VirtualTableState
}

const VirtualTable = ({ count, renderRow, state }: VirtualTableProp) => {
    
    const tableRoot = useRef<HTMLDivElement>(null)

    const [itemHeight, setItemHeight, itemHeightRef] = useStateRef(0)
    const [startOffset, setStartOffset] = useState(0)
    const [itemsDisplayCount, setItemsDisplayCount] = useState(100)

    useResizeObserver(tableRoot, e => {
        console.log("Resize", itemHeightRef.current)
        setItemsCount(e.contentBoxSize[0].blockSize, itemHeightRef.current)
//        setStartOffset(state.positionRef.current - itemsDisplayCountRef.current + 2)
    })

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        console.log("onKeyDown", e)
        switch (e.code) {
            case "ArrowDown":
                setPosition(state.position + 1)
                e.preventDefault()
                e.stopPropagation()
                break
            case "ArrowUp":
                setPosition(state.position - 1)
                e.preventDefault()
                e.stopPropagation()
                break
        }
    }

    const scrollIntoViewBottom = (newPos: number) => 
        setStartOffset(newPos - itemsDisplayCount + 2)
    
    const scrollIntoViewTop = (newPos: number) => 
        setStartOffset(newPos)

    const setPosition = (pos: number) => {
        var newPos = Math.max(Math.min(count - 1, pos), 0)
        console.log("newPos", newPos)
        if (newPos > startOffset + itemsDisplayCount - 2)
            scrollIntoViewBottom(newPos)
        else if (newPos < startOffset)
            scrollIntoViewTop(newPos)
        state.setPosition(newPos)
    }

    const getDisplayItems = () => 
        R.slice(startOffset, itemsDisplayCount + startOffset, [...Array(count).keys()])
        
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

    const setItemsCount = (clientHeight: number | undefined, itemsHeight: number) => 
        setItemsDisplayCount(Math.floor((clientHeight || 0) / itemsHeight) + 1) 

    const MeasureRow = () => {
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

// TODO ScrollIntoView when resizing
// TODO PageUp/PageDown Home/End
// TODO Scrollbar