interface TableRowProp {
    index: Number
}

interface TableRowsProp {
    count: Number
}

const TableRow = ({ index } : TableRowProp) => (
    <td>
        {`Der ${index}. Eintrag`}
    </td>
)

const TableRows = ({ count }: TableRowsProp) => (
    <>
     {
        [...Array(count).keys()]
            .map(n => (
                <tr key={n}>
                    <TableRow index={n} />
                </tr>))}
    </>
)

const VirtualTable = () => (
    <div className="App">
        <div className="tableroot" tabIndex={1}>
            <table>
                <thead>
                </thead>
                <tbody>
                    <TableRows count={5}/>
                </tbody>
            </table>
            <input id="restrictionInput" className="invisible none" />
        </div>
    </div>
)

export default VirtualTable

// TODO Steuerung des markierten Eintrages über Tastatur
// TODO td auslagern zum Konsumenten (slot)
// TODO Suchfunktion eines Eintrages (Markieren)