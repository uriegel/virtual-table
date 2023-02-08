import { ChangeEvent, useEffect } from 'react'
import './App.css'
import VirtualTable, { TableRowProp, useVirtualTableState } from './component/index'

const TableRow = ({ index, col } : TableRowProp) => (
	<td>
		<span>
			{`Der ${index}. Eintrag (${col})` }
		</span>
    </td>
)

const App = () => {

	const virtualTableState = useVirtualTableState()

	const search = (e: ChangeEvent<HTMLInputElement>) => {
		const num = Number.parseInt(e.target.value)
		console.log("Num", num)
		virtualTableState.setPosition(num)
	}

	const setColumns = virtualTableState.setColumns

	useEffect(() => {
		setColumns([
			{ name: "col 1" },
			{ name: "col 2" },
			{ name: "col 3" }
		])
	} , [setColumns])

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
