import React, { ChangeEvent, useEffect, useState } from 'react'
import './App.css'
import VirtualTable, { Column, TableRowItem } from './component/index'

const App = () => {

	const [position, setPosition] = useState(0)
	const [items, setItems] = useState([] as TableRowItem[])
	
	const search = (e: ChangeEvent<HTMLInputElement>) => {
		const num = Number.parseInt(e.target.value)
		console.log("Num", num)
		setPosition(num)
	}

	const [columns, setColumns] = useState({
		columns: [] as Column[],
		renderRow: (r: TableRowItem) => (<></>),
		measureRow: () => (<></>)
	})
	
	useEffect(() => {
		setColumns({
			columns: [
				{ name: "Name" },
				{ name: "Date" },
				{ name: "Details" }
			],
			renderRow: ({ index } : TableRowItem) => (
				<>
					<td>{`Der ${index}. Eintrag`}</td>
					<td>{`Datum ${index}`}</td>
					<td>{`Der ${index}. Eintrag in der 3. Spalte`}</td>
				</>
			),
			measureRow: () => (<td>{`Measure`}</td>)
		})

		const items = [...Array(200).keys()].map(n => ({index: n})) as TableRowItem[]
		setItems(items)
	} , [setColumns, setItems])

	return (
		<div className="App">
			<input type={'text'} onChange={search} />
			<div className="tableContainer">
				<VirtualTable columns={columns} items={items} position={position} setPosition={setPosition} />
			</div>
		</div>
	)
}

export default App
