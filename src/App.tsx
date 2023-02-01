import React from 'react'
import './App.css'
import VirtualTable, { TableRowProp } from './VirtualTable'

const TableRow = ({ index } : TableRowProp) => (
    <td>
        {`Der ${index}. Eintrag aus der App`}
    </td>
)

const App = () => (
	<div className="App">
		Hallo
		<VirtualTable count={8} renderRow={TableRow} />
	</div>
)

export default App
