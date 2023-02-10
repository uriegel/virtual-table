import React, { forwardRef, KeyboardEvent, useEffect, useImperativeHandle, useRef, useState } from 'react'
import './VirtualTable.css'
import useResizeObserver from '@react-hook/resize-observer'
import { TableRowsComponent } from './TableRowsComponent'
import { Scrollbar } from './Scrollbar'
import { Columns } from './Columns'

export interface Column {
    name: string,
    isSortable?: boolean
}

export interface TableColumns {
    columns: Column[]
    renderRow: (props: TableRowItem) => JSX.Element
    measureRow: ()=>JSX.Element
}

export interface TableRowItem {
    index: Number
}

interface VirtualTableProp {
    columns: TableColumns
    position: number
    items: TableRowItem[]
    setPosition: (pos: number)=>void
}

export type SetFocusHandle = {
    setFocus: () => void;
};
  
const VirtualTable = forwardRef<SetFocusHandle, VirtualTableProp>(({ columns, position, setPosition, items }, ref) => {
    
    useImperativeHandle(ref, () => ({
        setFocus() {
            tableRoot.current?.focus()
        },
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
        console.log("Resize", itemHeightRef.current, tableHead.current?.clientHeight)
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
        console.log("newPos", newPos)
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

    console.log("Rendering Virtual Table")
    return (
        <div className="vtr--tableroot" ref={tableRoot} tabIndex={0}
                onKeyDown={onKeyDown} onWheel={onWheel} onMouseDown={onTableMouseDown}>
            <table>
                <thead ref={tableHead}>
                    <Columns columns={columns.columns} />
                </thead>
                <tbody>
                <TableRowsComponent items={items} itemHeight={itemHeight} itemsDisplayCount={itemsDisplayCount}
                    position={position} renderRow={columns.renderRow} measureRow={columns.measureRow} setItemHeight={setItemHeight} setItemsCount={setItemsCount}
                    startOffset={startOffset} tableRoot={tableRoot} />
                </tbody>
            </table>
            <Scrollbar count={items.length} displayCount={itemsDisplayCount} headerHeight={tableHead.current?.clientHeight ?? 0}
                scrollPosition={startOffset} scrollbarHeight={tableHeight.current}
                setScrollPosition={setStartOffset} />
        </div>
    )
})

export default VirtualTable

// TODO Right aligned column (with content)
// TODO Sorting with column click:
// TODO Column is sortable click changes triangle and sends event per callback (sortAscending::before, sortDescending::before)
// TODO Column extended sort (Extension)
// TODO Theming
// TODO setting column widths per columns id
// TODO Event columnsWidthsChanged
// TODO Scrollbar pageup, pagedown must stop when reaching grip
// TODO Set Row class (selected item, hidden item, exif date)