import React from 'react'

const minScrollbarGripSize = 20

export interface ScrollbarProp {
    count: number
    displayCount: number
    headerHeight: number
    scrollbarHeight: number
    scrollPosition: number
}

export const Scrollbar = ({ count, displayCount, headerHeight, scrollbarHeight, scrollPosition }: ScrollbarProp) => {
    const range = Math.max(0, count - displayCount) + 1
    const gripHeight = Math.max(scrollbarHeight * (displayCount / count || 1), minScrollbarGripSize)
    const scrollbarGripTop = (scrollbarHeight - gripHeight) * (scrollPosition / range) 

    return (
        <div
            className={`vtr--scrollbar ${count < displayCount ? 'hidden' : ''}`}
            style={{ top: `${headerHeight}px`, height: `calc(100% - ${headerHeight}px)` }}>
            <div className={"vtr--scrollbar-grid"} style={{ top: `${scrollbarGripTop}px`, height: `${gripHeight}px` }}></div>
        </div>
)} 
