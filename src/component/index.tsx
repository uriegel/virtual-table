import React, { forwardRef, JSX, ReactElement, Ref, useEffect, useImperativeHandle, useRef, useState, useLayoutEffect } from 'react'
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
    renderColumn?: (name: string, click: (e: React.MouseEvent<HTMLElement>, id: number)=>void)=>string | JSX.Element
}

export interface TableColumns<TItem> {
    columns: Column[]
    getRowClasses?: (props: TItem)=>string[]
    renderRow: (props: TItem, click?: (id: number)=>void) => (JSX.Element | string)[]
    draggable?: boolean
    withoutHead?: boolean
}

export interface SelectableItem {
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

interface VirtualTableProp<TItem>  {
    items: TItem[]
    onPosition?: (item: TItem, position: number)=>void
    onSort?: (onSort: OnSort)=>void
    onColumnWidths?: (widths: number[])=>void
    onColumnClick?: (id: number)=>void
    onEnter?: (item: TItem, specialKeys: SpecialKeys, mouseActivated?: boolean)=>void
    onClick?: (item: TItem, id: number) => void
    onItemClick?: (item: TItem, position: number, ctrl: boolean)=>void
    onDragStart?: (evt: React.DragEvent)=>void
    onDrag?: (evt: React.DragEvent)=>void
    onDragEnd?: (evt: React.DragEvent) => void
    className?: string
    tabIndex?: number
}

export type VirtualTableHandle<TItem> = {
    setFocus: ()=>void
    setColumns: (columns: TableColumns<TItem>)=>void
    setPosition: (pos: number, newItems?: TItem[])=>void
    getPosition: ()=>number
    setInitialPosition: (pos: number, itemsLength: number)=>void
}

const VirtualTableImpl = <TItem extends Record<string, unknown>>({
    items, onPosition, onSort, onColumnWidths, onEnter, onDragStart, onDrag, onDragEnd, className, tabIndex, onClick, onItemClick, onColumnClick, }:
        VirtualTableProp<TItem>, ref: Ref<VirtualTableHandle<TItem>>) => {
    
    const tableRoot = useRef<HTMLDivElement>(null)
    const tableHead = useRef<HTMLTableSectionElement>(null)

	const [position, setStatePosition] = useState(0)
    const [itemHeight, setItemHeight ] = useState(0)
    const [startOffset, setStartOffset] = useState(0)
    const [itemsDisplayCount, setItemsDisplayCount] = useState(100)
	const [columns, setColumns] = useState<TableColumns<TItem>>({
		columns: [] as Column[],
		renderRow: () => [] as (JSX.Element|string)[],
        getRowClasses: () => [] as string[]
       
    })
    const [columnWidths, setColumnWidths] = useState([] as number[])

    const refPosition = useRef(position)
    const lastSelectedItem = useRef<TItem|null>(null)

    const scrollIntoViewBottom = (newPos: number) => 
        setStartOffset(newPos - itemsDisplayCount + 1)

    const scrollIntoViewTop = (newPos: number) => 
        setStartOffset(newPos)

    const setPosition = (pos: number) => {
        refPosition.current = pos
        setStatePosition(pos)
    }

    const setCheckedPosition = (pos: number, newItems?: TItem[], fromMouse?: boolean, ctrlKey?: boolean) => {
        const newPos = Math.max(Math.min((newItems || items).length - 1, pos), 0)
        if (newPos > startOffset + itemsDisplayCount - 1)
            scrollIntoViewBottom(newPos)
        else if (newPos < startOffset)
            scrollIntoViewTop(newPos)
        setPosition(newPos)
        if (fromMouse && onItemClick)
            onItemClick(items[newPos], newPos, ctrlKey == true)
    }
    
    useImperativeHandle(ref, () => ({
        setFocus() {
            tableRoot.current?.focus()
        },
        setPosition(pos: number, newItems?: TItem[]) {
            setCheckedPosition(pos, newItems)
        },
        setColumns(columns: TableColumns<TItem>) {
            setPosition(0)
            setColumns(columns)
            setColumnWidths(columns.columns.find(n => n.width == undefined)
                ? [...Array(columns.columns.length).keys()].map(() => 100 / columns.columns.length)
                : columns.columns.map(n => n.width!))
        },
        getPosition() {
            return refPosition.current
        },
        setInitialPosition(pos: number, itemsLength: number) {
            setStartOffset(0)
            const newPos = Math.max(Math.min(itemsLength - 1, pos), 0)
            if (newPos > itemsDisplayCount - 1)
                scrollIntoViewBottom(newPos)
            else if (newPos < 0)
                scrollIntoViewTop(newPos)
            setPosition(newPos)
        }
    }))

    const itemHeightRef = useRef(0)
    const itemsDisplayCountRef = useRef(0)
    const startOffsetRef = useRef(0)
    const tableHeight = useRef(0)
    const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(0)
    const [measuredTableHeight, setMeasuredTableHeight] = useState(0)

    useEffect(() => {
        if (onPosition && position < items.length && lastSelectedItem.current != items[position]) {
            lastSelectedItem.current = items[position]
            onPosition(items[position], position)
        }
    }, [position, onPosition, items])

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

    const setItemsCount = (clientHeight: number | undefined, itemsHeight: number) => {
        const count = Math.floor(((clientHeight || 0) - (tableHead.current?.clientHeight || 0)) / itemsHeight) 
        if (count != Infinity)
            setItemsDisplayCount(count) 
        return count
    }

    useEffect(() => {
        itemHeightRef.current = itemHeight
        if (itemHeight) {
            // Schedule measurement asynchronously to avoid calling setState
            // synchronously inside the effect body which can trigger cascading renders.
            const id = window.setTimeout(() => setItemsCount(tableRoot.current?.clientHeight, itemHeight), 0)
            return () => window.clearTimeout(id)
        }
    }, [itemHeight])
            
    useResizeObserver(tableRoot, e => {
        const itemsCount = setItemsCount(e.contentBoxSize[0].blockSize, itemHeightRef.current)
        tableHeight.current = (tableRoot.current?.clientHeight ?? 0) - (tableHead.current?.clientHeight ?? 0)
        // update measured heights for use in render (avoid reading refs during render)
        setMeasuredHeaderHeight(tableHead.current?.clientHeight ?? 0)
        setMeasuredTableHeight(tableHeight.current)
        if (itemsCount != Infinity) {
            if (position - startOffsetRef.current > itemsDisplayCountRef.current - 2)
                setStartOffset(Math.max(0, position - itemsCount + 1))   
            else if (items.length - startOffsetRef.current < itemsCount)
                setStartOffset(Math.max(0, items.length - itemsCount))   
        }
        console.log("resized", e.contentBoxSize[0].blockSize, itemHeightRef.current, tableHeight.current)
    })                      

    useLayoutEffect(() => {
        // set initial measured heights asynchronously to avoid synchronous
        // setState calls inside the layout effect body.
        const id = window.setTimeout(() => {
            setMeasuredHeaderHeight(tableHead.current?.clientHeight ?? 0)
            setMeasuredTableHeight((tableRoot.current?.clientHeight ?? 0) - (tableHead.current?.clientHeight ?? 0))
        }, 0)
        return () => window.clearTimeout(id)
    }, [])

    const onKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
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
                if (!e.shiftKey) {
                    setCheckedPosition(items.length - 1)
                    e.preventDefault()
                    e.stopPropagation()
                }
                break
            case "Home":
                if (!e.shiftKey) {
                    setCheckedPosition(0)
                    e.preventDefault()
                    e.stopPropagation()
                }
                break
            case "Enter":
                if (onEnter) {
                    onEnter(items[position], {
                        alt: e.altKey,
                        shift: e.shiftKey,
                        ctrl: e.ctrlKey
                    })
                    e.preventDefault()
                    e.stopPropagation()
                }
                break
            }
    }

    const onWheel = (sevt: React.WheelEvent) => {
		const evt = sevt.nativeEvent
		if (items.length > itemsDisplayCount) {
            const delta = evt.deltaY / Math.abs(evt.deltaY) * 3
            if (!Number.isNaN(delta)) {
                let newPos = startOffset + delta
                if (newPos < 0)
                    newPos = 0
                if (newPos > items.length - itemsDisplayCount) 
                    newPos = items.length - itemsDisplayCount
                    setStartOffset(newPos)
            }
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
                setCheckedPosition(currentIndex, items, true, sevt.ctrlKey)
        }
    }

    const onDoubleClick = (e: React.MouseEvent) => {
        if (onEnter)
            onEnter(items[position], {
                alt: e.altKey,
                shift: e.shiftKey,
                ctrl: e.ctrlKey
            }, true)
        e.preventDefault()
        e.stopPropagation()
    }

    return (
        <div className={`vtr--tableroot${items.length > itemsDisplayCount ? ' scrollbarActive' : ''}${className ? " " + className : ""}`}
                ref={tableRoot} tabIndex={tabIndex || 0 }
                onKeyDown={onKeyDown} onWheel={onWheel} onMouseDown={onTableMouseDown}>
            <table>
                {!columns.withoutHead
                    ? (<thead ref={tableHead}>
                        <Columns columns={columns.columns} onSort={onSort} columnWidths={columnWidths} setColumnWidths={setColumnWidths} onCustomColumnClick={onColumnClick} />
                    </thead>)
                    : null}
                <tbody onDoubleClick={onDoubleClick}>
                <TableRowsComponent<TItem> items={items} itemHeight={itemHeight} itemsDisplayCount={itemsDisplayCount} getRowClasses={columns.getRowClasses || (() => [])}
                        position={position} renderRow={columns.renderRow} draggable={columns.draggable} onDragStart={onDragStart} onDrag={onDrag}
                        onDragEnd={onDragEnd} setItemHeight={setItemHeight} setItemsCount={setItemsCount}
                        startOffset={startOffset} tableRoot={tableRoot} columns={columns.columns} click={id => onClick && onClick(items[position], id) } />
                </tbody>
            </table>
            <Scrollbar count={items.length} displayCount={itemsDisplayCount} headerHeight={measuredHeaderHeight}
                scrollPosition={startOffset} scrollbarHeight={measuredTableHeight}
                setScrollPosition={setStartOffset} />
        </div>
    )
}

const VirtualTable = forwardRef(VirtualTableImpl) as
  <TItem>(p: VirtualTableProp<TItem> & { ref?: Ref<VirtualTableHandle<TItem>> }) => ReactElement

export default VirtualTable
// TODO Scrollbar pageup, pagedown must stop when reaching grip
