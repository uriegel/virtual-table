import React, { KeyboardEvent, useState } from 'react'
import './VirtualTable.css'

export interface TableRowProp {
    index: Number
}

interface TableRowsProp {
    count: number
    state: VirtualTableState
    renderRow: (props: TableRowProp)=>JSX.Element
}

const TableRows = ({ count, renderRow, state }: TableRowsProp) => (
    <>
        {[...Array(count).keys()]
            .map(n => (
                <tr key={n} className={state.position == n ? 'selected'  : ''}>
                    {renderRow({ index: n })} 
                </tr>))}
    </>
)

interface VirtualTableState {
    position: number,
    setPosition: (pos: number)=>void
}

export const useVirtualTableState = () => {
    const [position, setPosition] = useState(0)
    return {
        position, setPosition 
    } as VirtualTableState
}

const VirtualTable = ({ count, renderRow, state }: TableRowsProp) => {
    
    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        console.log("Hallo", e)
        switch (e.code) {
            case "ArrowDown":
                state.setPosition(Math.min(count - 1, state.position + 1))
                e.preventDefault()
                e.stopPropagation()
                break
            case "ArrowUp":
                state.setPosition(Math.max(0, state.position - 1))
                e.preventDefault()
                e.stopPropagation()
                break
        }
    }
    
    return (
        <div className="App">
            <div className="tableroot" tabIndex={1} onKeyDown={onKeyDown}>
                <table>
                    <thead>
                    </thead>
                    <tbody>
                        <TableRows count={count} renderRow={renderRow} state={state} />
                    </tbody>
                </table>
                <input id="restrictionInput" className="invisible none" />
            </div>
        </div>
    )
}

export default VirtualTable

// TODO ResizeEventHook
// TODO copy VirtualTyble.css -> dist