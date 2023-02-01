import React, { KeyboardEvent, useState } from 'react'
import './VirtualTable.css'

export interface TableRowProp {
    index: Number
}

interface VirtualTableProp {
    count: number
    position: number
    renderRow: (props: TableRowProp)=>JSX.Element
}

const TableRows = ({ count, renderRow, position }: VirtualTableProp) => (
    <>
        {[...Array(count).keys()]
            .map(n => (
                <tr key={n} className={position == n ? 'selected'  : ''}>
                    {renderRow({ index: n })} 
                </tr>))}
    </>
)

const VirtualTable = ({ count, renderRow }: VirtualTableProp) => {
    const [ position, setPosition ] = useState(0)

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        console.log("Hallo", e)
        switch (e.code) {
            case "ArrowDown":
                setPosition(Math.min(count - 1, position + 1))
                e.preventDefault()
                e.stopPropagation()
                break
            case "ArrowUp":
                setPosition(Math.max(0, position - 1))
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
                        <TableRows count={count} renderRow={renderRow} position={position} />
                    </tbody>
                </table>
                <input id="restrictionInput" className="invisible none" />
            </div>
        </div>
    )
}

export default VirtualTable

// TODO Suchfunktion eines Eintrages (Markieren)
// TODO ResizeEventHook