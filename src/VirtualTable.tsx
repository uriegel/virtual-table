import React, { KeyboardEvent } from 'react'

export interface TableRowProp {
    index: Number
}

interface VirtualTableProp {
    count: Number
    renderRow: (props: TableRowProp)=>JSX.Element
}

const TableRows = ({ count, renderRow }: VirtualTableProp) => (
    <>
     {
        [...Array(count).keys()]
            .map(n => (
                <tr key={n}>
                    {renderRow({ index: n })} 
                </tr>))}
    </>
)

const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    console.log("Hallo", e)
}

const VirtualTable = ({count, renderRow }: VirtualTableProp) => (
    <div className="App">
        <div className="tableroot" tabIndex={1} onKeyDown={onKeyDown}>
            <table>
                <thead>
                </thead>
                <tbody>
                    <TableRows count={count} renderRow ={renderRow} />
                </tbody>
            </table>
            <input id="restrictionInput" className="invisible none" />
        </div>
    </div>
)

export default VirtualTable

// TODO Steuerung des markierten Eintrages über Tastatur
// TODO Suchfunktion eines Eintrages (Markieren)
// TODO ResizeEventHook