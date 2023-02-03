import React, { MouseEvent, useRef } from 'react'

export const Columns = () => {

    const draggingReady = useRef(false)

    const onMouseMove = (e: MouseEvent<HTMLTableRowElement>) => {
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

    return (
        <tr onMouseMove={onMouseMove}>
            <th>Column 1</th>
            <th>Column 2</th>
            <th>Column 3</th>
        </tr>
    )
}