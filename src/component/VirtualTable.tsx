import React, { KeyboardEvent, useEffect, useRef, useState } from 'react'
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

    const [itemHeight, setItemHeight ] = useState(0)
    const [startOffset, setStartOffset] = useState(0)
    const [itemsDisplayCount, setItemsDisplayCount] = useState(100)

    const itemHeightRef = useRef(0)
    const itemsDisplayCountRef = useRef(0)
    const positionRef = useRef(0)
    const startOffsetRef = useRef(0)

    useEffect(() => {
        itemHeightRef.current = itemHeight
        if (itemHeight)
            setItemsCount(tableRoot.current?.clientHeight, itemHeight)
    }, [itemHeight])

    useEffect(() => {
        positionRef.current = state.position
    }, [state.position])

    useEffect(() => {
        itemsDisplayCountRef.current = itemsDisplayCount
    }, [itemsDisplayCount])

    useEffect(() => {
        startOffsetRef.current = startOffset
    }, [startOffset])
            
    useResizeObserver(tableRoot, e => {
        console.log("Resize", itemHeightRef.current)
        const count = setItemsCount(e.contentBoxSize[0].blockSize, itemHeightRef.current)
        if (positionRef.current - startOffsetRef.current > itemsDisplayCountRef.current - 2)
            setStartOffset(Math.max(0, positionRef.current - count + 2))    
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

    const setItemsCount = (clientHeight: number | undefined, itemsHeight: number) => {
        const count = Math.floor((clientHeight || 0) / itemsHeight) + 1
        setItemsDisplayCount(count) 
        return count
    }
        

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

// TODO Scroll down when resizing and too few items when resizing
// TODO PageUp/PageDown Home/End
// TODO Scrollbar