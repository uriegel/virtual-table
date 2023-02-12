import React, { useEffect, useRef, useState } from 'react'
import { Column, OnSort } from '.'

interface ColumnsProps {
    columns: Column[]
    columnWidths: number[]
    setColumnWidths: (widths: number[])=>void
    onSort?: (onSort: OnSort) => void
}

export const Columns = ({ columns, onSort, columnWidths, setColumnWidths }: ColumnsProps) => {

    const [sortIndex, setSortIndex] = useState(-1)
    const [subColumnSort, setSubColumnSort] = useState(false)
    const [sortDescending, setSortDescending] = useState(false)
    
    const draggingReady = useRef(false)
    const dragging = useRef(false)

    useEffect(() => {
        setSortIndex(-1)
        setSubColumnSort(false)
    }, [columns])

    const onMouseMove = (e: React.MouseEvent<HTMLTableRowElement>) => {
        const evt = e.nativeEvent
        const element = (evt.target as HTMLElement).tagName == "TH" ? evt.target : (evt.target as HTMLElement).parentElement?.parentElement
        const thWidth = (element as HTMLElement)?.clientWidth + (element as HTMLElement)?.clientLeft
        const mouseX = evt.offsetX + (element as HTMLElement)?.clientLeft
        const trRect = (element as HTMLElement)?.parentElement?.getBoundingClientRect()
        const absoluteRight = trRect!.width + trRect!.x                
        let dr = 
            (mouseX < 3 || mouseX > thWidth - 4) 
            && (evt.pageX - trRect!.x > 4)
            && (evt.pageX < absoluteRight - 4)
        if (dr && (evt.target as HTMLElement).tagName != "TH") {
            const first = (evt.target as HTMLElement).style.flexGrow == "1"
            if (first && mouseX > thWidth - 4 || !first && mouseX < 3)
                dr = false
        }
        draggingReady.current = dr
        document.body.style.cursor = dr ? 'ew-resize' : 'auto'
    }

    const onMouseDown = (e: React.MouseEvent<HTMLTableRowElement>) => {
        const evt = e.nativeEvent
        if (draggingReady.current) {
            dragging.current = true
            const th = evt.target as HTMLElement
            const mouseX = evt.offsetX + th.clientLeft
            const dragleft = mouseX < 3

            const startDragPosition = evt.pageX
            const targetColumn = th.closest("th")

            const currentHeader = (dragleft ? targetColumn?.previousElementSibling : targetColumn) as HTMLElement
            if (!currentHeader)
                return
            const nextHeader = currentHeader.nextElementSibling as HTMLElement
            if (!nextHeader)
                return

            const currentLeftWidth = currentHeader?.offsetWidth
            const sumWidth = currentLeftWidth + nextHeader?.offsetWidth

            const onmove = (evt: MouseEvent) => {
                document.body.style.cursor = 'ew-resize'
                let diff = evt.pageX - startDragPosition
                if (currentLeftWidth + diff < 15)
                    diff = 15 - currentLeftWidth
                else if (diff > sumWidth - currentLeftWidth - 15)
                    diff = sumWidth - currentLeftWidth - 15

                const getCombinedWidth = (column: HTMLElement, nextColumn: HTMLElement) => {
                    const firstWidth = 
                        column.style.width
                        ? parseFloat(column.style.width.substring(0, column.style.width.length - 1))
                        : 100 / columns.length
                    const secondWidth = 
                        nextColumn.style.width
                        ? parseFloat(nextColumn.style.width.substring(0, nextColumn.style.width.length - 1))
                        : 100 / columns.length
                    return firstWidth + secondWidth
                }                        

                const combinedWidth = getCombinedWidth(currentHeader, nextHeader)

                let leftWidth = currentLeftWidth + diff
                let rightWidth = sumWidth - currentLeftWidth - diff
                const factor = combinedWidth / sumWidth
                leftWidth = leftWidth * factor
                rightWidth = rightWidth * factor

                currentHeader.style.width = leftWidth + '%'
                nextHeader.style.width = rightWidth + '%'
                evt.preventDefault()
            }

            const onup = (evt: MouseEvent) => {
                
                const preventClickOnResetting = () => setTimeout(() => dragging.current = false)
                
                const getWidths = () => {
                    const ths = Array.from(targetColumn!.parentElement!.children) as HTMLElement[]
                    return ths.map(th => 
                        th.style.width 
                            ? parseFloat(th.style.width.substring(0, th.style.width.length - 1))
                            : 100 / columns.length
                    )
                }

                window.removeEventListener('mousemove', onmove)
                window.removeEventListener('mouseup', onup)
                document.body.style.cursor = 'auto'
                setColumnWidths(getWidths())
                preventClickOnResetting()
                evt.preventDefault()
                evt.stopPropagation()
            }

            window.addEventListener('mousemove', onmove)
            window.addEventListener('mouseup', onup)
            evt.preventDefault()
            evt.stopPropagation()
        }
    }

    const onMouseLeave = (e: React.MouseEvent<HTMLTableRowElement>) => {
        draggingReady.current = false
        document.body.style.cursor = 'auto'        
    }

    const getcolumnClass = (col: Column, index: number) =>
        [
            col.isSortable ? "sortable" : null,
            col.subColumn ? "subcolumn" : null,
            col.isRightAligned ? "rightAligned" : null,
            !col.subColumn && index == sortIndex ? (sortDescending ? "sortDescending" : "sortAscending") : ""
        ].filter(n => !!n)
            .join(' ')
    
    const onColumnClick = (index: number, isColumnSort: boolean, isSortable?: boolean, evt?: React.MouseEvent) => {
        if (isSortable && !dragging.current) {
            setSortIndex(index)
            setSubColumnSort(isColumnSort)
            const isDescending = (index != sortIndex || subColumnSort != isColumnSort) 
                ? false
                : !sortDescending
            setSortDescending(isDescending)
            if (onSort)
                onSort({ column: index, isDescending, isSubColumn: isColumnSort })
            if (evt) 
                evt.stopPropagation()
        }
    }

    return (
        <tr onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseLeave={onMouseLeave}>
            {
                columns.map((n, i) =>
                (<th key={n.name} style={{ width: `${columnWidths[i]}%` } } className={getcolumnClass(n, i)} onClick={() => onColumnClick(i, false, n.isSortable)}>
                    {n.subColumn
                        ? (<div className="subColumns">
                            <span className={`subColumnName${i == sortIndex && !subColumnSort ? (sortDescending ? " sortDescending" : " sortAscending") : ""}`}>{n.name}</span>
                            <span className={`${i == sortIndex && subColumnSort ? (sortDescending ? "sortDescending" : "sortAscending") : ""}`}
                                onClick={evt => onColumnClick(i, true, n.isSortable, evt)}>{n.subColumn}</span>
                        </div>)
                        : n.name}
                </th>))
            }
        </tr>
    )
}