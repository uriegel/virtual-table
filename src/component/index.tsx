import React, { KeyboardEvent, useEffect, useRef, useState } from 'react'
import './VirtualTable.css'
import useResizeObserver from '@react-hook/resize-observer'
import { TableRowsComponent } from './TableRowsComponent'
import { Scrollbar } from './Scrollbar'
import { Columns } from './Columns'

export interface Column {
    name: string
}

export interface TableColumns {
    columns: Column[]
    renderRow: (props: TableRowItem)=>JSX.Element
}

export interface TableRowItem {
    index: Number
}

interface VirtualTableProp {
    state: VirtualTableState
    columns: TableColumns
    setColumns: (cols: TableColumns)=>void
}

interface VirtualTableState {
    position: number,
    setPosition: (pos: number) => void
    items: TableRowItem[]
    setItems: (items: TableRowItem[])=>void
}

export const useVirtualTableState = () => {
    const [position, setPosition] = useState(0)
    const [items, setItems] = useState([] as TableRowItem[])
    return {
        position, setPosition, items, setItems
    } as VirtualTableState
}

const VirtualTable = ({ state, columns, setColumns }: VirtualTableProp) => {
    
    const tableRoot = useRef<HTMLDivElement>(null)
    const tableHead = useRef<HTMLTableSectionElement>(null)

    const [itemHeight, setItemHeight ] = useState(0)
    const [startOffset, setStartOffset] = useState(0)
    const [itemsDisplayCount, setItemsDisplayCount] = useState(100)

    const itemHeightRef = useRef(0)
    const itemsDisplayCountRef = useRef(0)
    const positionRef = useRef(0)
    const startOffsetRef = useRef(0)
    const tableHeight = useRef(0)

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
        console.log("Resize", itemHeightRef.current, tableHead.current?.clientHeight)
        const itemsCount = setItemsCount(e.contentBoxSize[0].blockSize, itemHeightRef.current)
        tableHeight.current = (tableRoot.current?.clientHeight ?? 0) - (tableHead.current?.clientHeight ?? 0)
        if (positionRef.current - startOffsetRef.current > itemsDisplayCountRef.current - 2)
            setStartOffset(Math.max(0, positionRef.current - itemsCount + 2))   
        else if (state.items.length - startOffsetRef.current < itemsCount)
            setStartOffset(Math.max(0, state.items.length - itemsCount + 1))   
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
            case "PageDown":
                setPosition(state.position + itemsDisplayCount - 1)
                e.preventDefault()
                e.stopPropagation()
                break
            case "PageUp":
                setPosition(state.position -  itemsDisplayCount + 1)
                e.preventDefault()
                e.stopPropagation()
                break
            case "End":
                setPosition(state.items.length - 1)
                e.preventDefault()
                e.stopPropagation()
                break
            case "Home":
                setPosition(0)
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
        var newPos = Math.max(Math.min(state.items.length - 1, pos), 0)
        console.log("newPos", newPos)
        if (newPos > startOffset + itemsDisplayCount - 2)
            scrollIntoViewBottom(newPos)
        else if (newPos < startOffset)
            scrollIntoViewTop(newPos)
        state.setPosition(newPos)
    }

    const setItemsCount = (clientHeight: number | undefined, itemsHeight: number) => {
        const count = Math.floor(((clientHeight || 0) - (tableHead.current?.clientHeight || 0)) / itemsHeight) + 1
        setItemsDisplayCount(count) 
        return count
    }

    const onWheel = (revt: React.WheelEvent) => {
		const evt = revt.nativeEvent
		if (state.items.length > itemsDisplayCount) {
			var delta = evt.deltaY / Math.abs(evt.deltaY) * 3
			let newPos = startOffset + delta
			if (newPos < 0)
				newPos = 0
			if (newPos > state.items.length - itemsDisplayCount + 1) 
				newPos = state.items.length - itemsDisplayCount + 1
				setStartOffset(newPos)
		}        
	}			

    console.log("Rendering Virtual Table")
    return (
        <div className="vtr--tableroot" ref={tableRoot} tabIndex={0}
                onKeyDown={onKeyDown} onWheel={onWheel}>
            <table>
                <thead ref={tableHead}>
                    <Columns columns={columns.columns} />
                </thead>
                <tbody>
                <TableRowsComponent items={state.items} itemHeight={itemHeight} itemsDisplayCount={itemsDisplayCount}
                    position={state.position} renderRow={columns.renderRow} setItemHeight={setItemHeight} setItemsCount={setItemsCount}
                    startOffset={startOffset} tableRoot={tableRoot} />
                </tbody>
            </table>
            <Scrollbar count={state.items.length} displayCount={itemsDisplayCount} headerHeight={tableHead.current?.clientHeight ?? 0}
                scrollPosition={startOffset} scrollbarHeight={tableHeight.current}
                setScrollPosition={setStartOffset} />
        </div>
    )
}

export default VirtualTable

// TODO renderRow => renderCol
// TODO change columns
// TODO move items to App
// TODO Generic Items
// TODO fill changed items
// TODO Theming
// TODO Scrollbar pageup, pagedown must stop when reaching grip
// TODO Set Row class (selected item, hidden item, exif date)