import React from 'react'

export interface ScrollbarProp {
    count: number
    displayCount: number
}

export const Scrollbar = ({ count, displayCount }: ScrollbarProp) => {
    return (
        <div className={`vtr__scrollbar ${count < displayCount ? 'hidden' : ''}`}></div>
)} 
