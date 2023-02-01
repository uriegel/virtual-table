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

	const state = useVirtualTableState()

	const search = (e: ChangeEvent<HTMLInputElement>) => {
		console.log("Tschänscht", e.target.value)
		const num = Number.parseInt(e.target.value)
		console.log("Num", num)
		state.setPosition(num)
	}

	return (
		<div className="App">
			<input type={'text'} onChange={search} />
			<table>
				<tbody>
					<tr>
						<td><span>Hallo</span></td>
					</tr>
						<td><span>Hallo</span></td>	
					<tr>
						<td><span>Hallo</span></td>
					</tr>
				</tbody>
			</table>
			<VirtualTable count={8} renderRow={TableRow} state={state} />
		</div>
	)
}

export default App
