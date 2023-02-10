import React, { forwardRef, KeyboardEvent, useEffect, useImperativeHandle, useRef, useState } from 'react'
import './VirtualTable.css'
import useResizeObserver from '@react-hook/resize-observer'
import { TableRowsComponent } from './TableRowsComponent'
import { Scrollbar } from './Scrollbar'
import { Columns } from './Columns'

export interface Column {
    name: string,
    isSortable?: boolean
    isRightAligned?: boolean
    subColumn?: string
    width?: number
}

export interface TableColumns {
    columns: Column[]
    renderRow: (props: TableRowItem) => (JSX.Element|string)[]
    measureRow: ()=>JSX.Element|string
}

export interface TableRowItem {
    index: number
    isSelected?: boolean
}

export interface OnSort {
    column: number
    isDescending: boolean
    isSubColumn: boolean        
}

interface VirtualTableProp {
    columns: TableColumns
    position: number
    items: TableRowItem[]
    setPosition: (pos: number) => void
    onSort: (onSort: OnSort) => void
    setWidths?: (widths: number[])=>void
}

export type VirtualTableHandle = {
    setFocus: () => void;
    setPosition: (pos: number) => void
};
  
const VirtualTable = forwardRef<VirtualTableHandle, VirtualTableProp>(({ columns, position, setPosition, items, onSort, setWidths }, ref) => {
    
    useImperativeHandle(ref, () => ({
        setFocus() {
            tableRoot.current?.focus()
        },
        setPosition(pos: number) {
            setCheckedPosition(pos)
        }
    }))

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
        positionRef.current = position
    }, [position])

    useEffect(() => {
        itemsDisplayCountRef.current = itemsDisplayCount
    }, [itemsDisplayCount])

    useEffect(() => {
        startOffsetRef.current = startOffset
    }, [startOffset])
            
    useResizeObserver(tableRoot, e => {
        const itemsCount = setItemsCount(e.contentBoxSize[0].blockSize, itemHeightRef.current)
        tableHeight.current = (tableRoot.current?.clientHeight ?? 0) - (tableHead.current?.clientHeight ?? 0)
        if (positionRef.current - startOffsetRef.current > itemsDisplayCountRef.current - 2)
            setStartOffset(Math.max(0, positionRef.current - itemsCount + 2))   
        else if (items.length - startOffsetRef.current < itemsCount)
            setStartOffset(Math.max(0, items.length - itemsCount + 1))   
    })                      

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        console.log("onKeyDown", e)
        switch (e.code) {
            case "ArrowDown":
                setCheckedPosition(position + 1)
                e.preventDefault()
                e.stopPropagation()
                break
            case "ArrowUp":
                setCheckedPosition(position - 1)
                e.preventDefault()
                e.stopPropagation()
                break
            case "PageDown":
                setCheckedPosition(position + itemsDisplayCount - 1)
                e.preventDefault()
                e.stopPropagation()
                break
            case "PageUp":
                setCheckedPosition(position -  itemsDisplayCount + 1)
                e.preventDefault()
                e.stopPropagation()
                break
            case "End":
                setCheckedPosition(items.length - 1)
                e.preventDefault()
                e.stopPropagation()
                break
            case "Home":
                setCheckedPosition(0)
                e.preventDefault()
                e.stopPropagation()
                break
            }
    }

    const scrollIntoViewBottom = (newPos: number) => 
        setStartOffset(newPos - itemsDisplayCount + 2)
    
    const scrollIntoViewTop = (newPos: number) => 
        setStartOffset(newPos)

    const setCheckedPosition = (pos: number) => {
        var newPos = Math.max(Math.min(items.length - 1, pos), 0)
        if (newPos > startOffset + itemsDisplayCount - 2)
            scrollIntoViewBottom(newPos)
        else if (newPos < startOffset)
            scrollIntoViewTop(newPos)
        setPosition(newPos)
    }

    const setItemsCount = (clientHeight: number | undefined, itemsHeight: number) => {
        const count = Math.floor(((clientHeight || 0) - (tableHead.current?.clientHeight || 0)) / itemsHeight) + 1
        setItemsDisplayCount(count) 
        return count
    }

    const onWheel = (sevt: React.WheelEvent) => {
		const evt = sevt.nativeEvent
		if (items.length > itemsDisplayCount) {
			var delta = evt.deltaY / Math.abs(evt.deltaY) * 3
			let newPos = startOffset + delta
			if (newPos < 0)
				newPos = 0
			if (newPos > items.length - itemsDisplayCount + 1) 
				newPos = items.length - itemsDisplayCount + 1
				setStartOffset(newPos)
		}        
	}			

    function onTableMouseDown(sevt: React.MouseEvent) {
        const element = sevt.target as HTMLElement
        const tr = element?.closest("tbody tr") as HTMLElement
        if (tr) {
            const currentIndex = 
                Array
                    .from(tr!.parentElement!.children)
                    .findIndex(n => n == tr)
                + startOffset
            if (currentIndex != -1) 
                setCheckedPosition(currentIndex)
        }
    }

    return (
        <div className={`vtr--tableroot ${items.length >= itemsDisplayCount ? 'scrollbarActive' : ''}`}
                ref={tableRoot} tabIndex={0}
                onKeyDown={onKeyDown} onWheel={onWheel} onMouseDown={onTableMouseDown}>
            <table>
                <thead ref={tableHead}>
                    <Columns columns={columns.columns} onSort={onSort} setWidths={setWidths} />
                </thead>
                <tbody>
                <TableRowsComponent items={items} itemHeight={itemHeight} itemsDisplayCount={itemsDisplayCount}
                    position={position} renderRow={columns.renderRow} measureRow={columns.measureRow} setItemHeight={setItemHeight} setItemsCount={setItemsCount}
                    startOffset={startOffset} tableRoot={tableRoot} columns={columns.columns} />
                </tbody>
            </table>
            <Scrollbar count={items.length} displayCount={itemsDisplayCount} headerHeight={tableHead.current?.clientHeight ?? 0}
                scrollPosition={startOffset} scrollbarHeight={tableHeight.current}
                setScrollPosition={setStartOffset} />
        </div>
    )
})

export default VirtualTable

// TODO column withs always in render
// TODO setting column widths per columns id
// TODO deleting localstorage widths
// TODO Event columnsWidthsChanged
// TODO Scrollbar pageup, pagedown must stop when reaching grip
