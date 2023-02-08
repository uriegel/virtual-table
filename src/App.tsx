import { ChangeEvent, useEffect } from 'react'
import './App.css'
import VirtualTable, { TableRowItem, useVirtualTableState } from './component/index'

const TableRow = ({ index } : TableRowItem) => (
	<>
		<td>{`Der ${index}. Eintrag`}</td>
		<td>{`Datum ${index}`}</td>
		<td>{`Der ${index}. Eintrag in der 3. Spalte`}</td>
	</>
)

const App = () => {

	const virtualTableState = useVirtualTableState()

	const search = (e: ChangeEvent<HTMLInputElement>) => {
		const num = Number.parseInt(e.target.value)
		console.log("Num", num)
		virtualTableState.setPosition(num)
	}

	const setColumns = virtualTableState.setColumns
	const setItems = virtualTableState.setItems

	useEffect(() => {
		setColumns([
			{ name: "Name" },
			{ name: "Date" },
			{ name: "Details" }
		])

		const items = [...Array(200).keys()].map(n => ({index: n})) as TableRowItem[]
		setItems(items)
	} , [setColumns, setItems])

	return (
		<div className="App">
			<input type={'text'} onChange={search} />
			<div className="tableContainer">
				<VirtualTable renderRow={TableRow} state={virtualTableState} />
			</div>
		</div>
	)
}

export default App
