import React from 'react'

export interface ScrollbarProp {
    count: number
    displayCount: number
    headerHeight: number
}

export const Scrollbar = ({ count, displayCount, headerHeight }: ScrollbarProp) => {
    return (
        <div className={`vtr__scrollbar ${count < displayCount ? 'hidden' : ''}`} style={{ top: `${headerHeight}px`, height: `calc(100% - ${headerHeight}px)` } }></div>
)} 
