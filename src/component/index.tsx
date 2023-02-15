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
    getRowClasses?: (props: TableRowItem) => string[]
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

export interface SpecialKeys {
    alt: boolean
    ctrl: boolean
    shift: boolean
}

interface VirtualTableProp {
    items: TableRowItem[]
    onPosition?: (position: number)=>void
    onSort?: (onSort: OnSort) => void
    onColumnWidths?: (widths: number[]) => void
    onEnter?: (item: TableRowItem, specialKeys: SpecialKeys) => void
}

export type VirtualTableHandle = {
    setFocus: ()=>void
    setColumns: (columns: TableColumns) => void
    setPosition: (pos: number)=>void
    getPosition: () => number
    setInitialPosition: (pos: number, itemsLength: number)=>void
}

export const createEmptyHandle = () => ({
    setFocus: () => { },
    setColumns: (columns: TableColumns)=>{},
    setPosition: (pos: number) => { },
    getPosition: () => 0,
    setInitialPosition: (pos: number, itemsLength: number) => { }
})
  
const VirtualTable = forwardRef<VirtualTableHandle, VirtualTableProp>(({
    items, onPosition, onSort, onColumnWidths, onEnter }, ref) => {
    
    useImperativeHandle(ref, () => ({
        setFocus() {
            tableRoot.current?.focus()
        },
        setPosition(pos: number) {
            setCheckedPosition(pos)
        },
        setColumns(columns: TableColumns) {
            setPosition(0)
            setColumns(columns)
            setColumnWidths(columns.columns.find(n => n.width == undefined)
                ? [...Array(columns.columns.length).keys()].map(n => 100 / columns.columns.length)
                : columns.columns.map(n => n.width!))
        },
        getPosition() {
            return position
        },
        setInitialPosition(pos: number, itemsLength: number) {
            var newPos = Math.max(Math.min(itemsLength - 1, pos), 0)
            if (newPos > itemsDisplayCount - 1)
                scrollIntoViewBottom(newPos)
            else if (newPos < 0)
                scrollIntoViewTop(newPos)
            setPosition(newPos)
            setStartOffset(0)
        }
    }))

    const tableRoot = useRef<HTMLDivElement>(null)
    const tableHead = useRef<HTMLTableSectionElement>(null)

	const [position, setPosition] = useState(0)
    const [itemHeight, setItemHeight ] = useState(0)
    const [startOffset, setStartOffset] = useState(0)
    const [itemsDisplayCount, setItemsDisplayCount] = useState(100)
	const [columns, setColumns] = useState<TableColumns>({
		columns: [] as Column[],
		renderRow: (r: TableRowItem) => [] as (JSX.Element|string)[],
        measureRow: () => "" as JSX.Element | string,
        getRowClasses: (r: TableRowItem) => [] as string[]
       
    })
    const [columnWidths, setColumnWidths] = useState([] as number[])
    
    const itemHeightRef = useRef(0)
    const itemsDisplayCountRef = useRef(0)
    const startOffsetRef = useRef(0)
    const tableHeight = useRef(0)

    useEffect(() => {
        itemHeightRef.current = itemHeight
        if (itemHeight)
            setItemsCount(tableRoot.current?.clientHeight, itemHeight)
    }, [itemHeight])

    useEffect(() => {
        if (onPosition)
            onPosition(position)
    }, [position, onPosition])

    useEffect(() => {
        itemsDisplayCountRef.current = itemsDisplayCount
    }, [itemsDisplayCount])

    useEffect(() => {
        startOffsetRef.current = startOffset
    }, [startOffset])

    useEffect(() => {
        if (onColumnWidths)
            onColumnWidths(columnWidths)
    }, [columnWidths, onColumnWidths])
            
    useResizeObserver(tableRoot, e => {
        const itemsCount = setItemsCount(e.contentBoxSize[0].blockSize, itemHeightRef.current)
        tableHeight.current = (tableRoot.current?.clientHeight ?? 0) - (tableHead.current?.clientHeight ?? 0)
        if (position - startOffsetRef.current > itemsDisplayCountRef.current - 2)
            setStartOffset(Math.max(0, position - itemsCount + 1))   
        else if (items.length - startOffsetRef.current < itemsCount)
            setStartOffset(Math.max(0, items.length - itemsCount))   
    })                      

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
            case "Enter":
                if (onEnter)
                    onEnter(items[position], {
                        alt: e.altKey,
                        shift: e.shiftKey,
                        ctrl: e.ctrlKey
                    })
                e.preventDefault()
                e.stopPropagation()
                break
            }
    }

    const scrollIntoViewBottom = (newPos: number) => 
        setStartOffset(newPos - itemsDisplayCount + 1)
    
    const scrollIntoViewTop = (newPos: number) => 
        setStartOffset(newPos)

    const setCheckedPosition = (pos: number) => {
        var newPos = Math.max(Math.min(items.length - 1, pos), 0)
        if (newPos > startOffset + itemsDisplayCount - 1)
            scrollIntoViewBottom(newPos)
        else if (newPos < startOffset)
            scrollIntoViewTop(newPos)
        setPosition(newPos)
    }

    const setItemsCount = (clientHeight: number | undefined, itemsHeight: number) => {
        const count = Math.floor(((clientHeight || 0) - (tableHead.current?.clientHeight || 0)) / itemsHeight) 
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
			if (newPos > items.length - itemsDisplayCount) 
				newPos = items.length - itemsDisplayCount
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

    const onDoubleClick = (e: React.MouseEvent) => {
        if (onEnter)
            onEnter(items[position], {
                alt: e.altKey,
                shift: e.shiftKey,
                ctrl: e.ctrlKey
            })
        e.preventDefault()
        e.stopPropagation()
    }

    return (
        <div className={`vtr--tableroot ${items.length > itemsDisplayCount ? 'scrollbarActive' : ''}`}
                ref={tableRoot} tabIndex={0}
                onKeyDown={onKeyDown} onWheel={onWheel} onMouseDown={onTableMouseDown}>
            <table>
                <thead ref={tableHead}>
                    <Columns columns={columns.columns} onSort={onSort} columnWidths={columnWidths} setColumnWidths={setColumnWidths} />
                </thead>
                <tbody onDoubleClick={onDoubleClick}>
                <TableRowsComponent items={items} itemHeight={itemHeight} itemsDisplayCount={itemsDisplayCount} getRowClasses={columns.getRowClasses || (_ => [])}
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
// TODO Scrollbar pageup, pagedown must stop when reaching grip
