import React, { useRef } from 'react'

// TODO
const columns = [0, 1, 2]

export const Columns = () => {

    const draggingReady = useRef(false)

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
                // const getWidths = () => {
                //     const ths = Array.from(targetColumn!.parentElement!.children) as HTMLElement[]
                //      return ths.map(th => 
                //          th.style.width 
                //             ? parseFloat(th.style.width.substring(0, th.style.width.length - 1))
                //             : 100 / columns.length
                //      )
                // }

                window.removeEventListener('mousemove', onmove)
                window.removeEventListener('mouseup', onup)
                document.body.style.cursor = 'auto'
                
                //const widths = getWidths()
                
                // TODO Send event to parent
                // this.dispatchEvent(new CustomEvent('columnwidths', { detail: widths }))
                // TODO Save with ID
                // if (this.saveWidthIdentifier)
                    // localStorage.setItem(this.saveWidthIdentifier, JSON.stringify(widths)) 
                // TOD SetFocus
                //this.setFocus()
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

    return (
        <tr onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseLeave={onMouseLeave}>
            <th>Column 1</th>
            <th>Column 2</th>
            <th>Column 3</th>
        </tr>
    )
}