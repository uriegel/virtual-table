import React from 'react'

export interface ScrollbarProp {
    count: number
    displayCount: number
    headerHeight: number
}

export const Scrollbar = ({ count, displayCount, headerHeight }: ScrollbarProp) => {
    const gripHeight = Math.max(5, displayCount / count * 100)
    return (
        <div
            className={`vtr--scrollbar ${count < displayCount ? 'hidden' : ''}`}
            style={{ top: `${headerHeight}px`, height: `calc(100% - ${headerHeight}px)` }}>
            <div className={"vtr--scrollbar-grid"} style={{ top: `10px`, height: `${gripHeight}%` }}></div>
        </div>
)} 
