import { ChangeEvent } from 'react'
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

	return (
		<div className="App">
			<input type={'text'} onChange={search} />
			<div className="tableContainer">
				<VirtualTable count={2000} renderRow={TableRow} state={virtualTableState} />
			</div>
		</div>
	)
}

export default App
