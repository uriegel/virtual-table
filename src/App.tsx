import React, { ChangeEvent } from 'react'
import './App.css'
import VirtualTable, { TableRowProp, useVirtualTableState } from './component/VirtualTable'

const TableRow = ({ index } : TableRowProp) => (
	<td>
		<span>
			{`Der ${index}. Eintrag`}
		</span>
        
    </td>
)

const App = () => {

	const virtualTableState = useVirtualTableState()

	const search = (e: ChangeEvent<HTMLInputElement>) => {
		console.log("Tschänscht", e.target.value)
		const num = Number.parseInt(e.target.value)
		console.log("Num", num)
		virtualTableState.setPosition(num)
	}

	return (
		<div className="App">
			<input type={'text'} onChange={search} />
			<div className="tableContainer">
				<VirtualTable count={20} renderRow={TableRow} state={virtualTableState} />
			</div>
		</div>
	)
}

export default App
