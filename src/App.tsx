import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import VirtualTable, { Column, SetFocusHandle, TableRowItem } from './component/index'

const App = () => {

	const setFocus = useRef<SetFocusHandle>(null)

	const [position, setPosition] = useState(0)
	const [items, setItems] = useState([] as TableRowItem[])
	
	const [columns, setColumns] = useState({
		columns: [] as Column[],
		renderRow: (r: TableRowItem) => (<></>),
		measureRow: () => (<></>)
	})

	useEffect(() => setFocus.current?.setFocus(), [])
	
	useEffect(() => {
		setColumns({
			columns: [
				{ name: "Name", isSortable: true },
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
	}, [setColumns, setItems])
	
	function changeColumns() {
		setPosition(0)
		setItems([])		
		setColumns({
			columns: [
				{ name: "Name" },
				{ name: "Neue Spalte 1" },
				{ name: "Neue Spalte 2" },
				{ name: "Neue Spalte 3" }
			],
			renderRow: ({ index } : TableRowItem) => (
				<>
					<td>{`Der ${index}. Eintrag`}</td>
					<td>{`Spalte 1 ${index}`}</td>
					<td>{`Spalte 2 ${index}`}</td>
					<td>{`Spalte 3 ${index}`}</td>
				</>
			),
			measureRow: () => (<td>{`Measure`}</td>)
		})
	}

	function onItems() {
		const items = [...Array(2000).keys()].map(n => ({index: n})) as TableRowItem[]
		setItems(items)
		setFocus.current?.setFocus()
	}

	return (
		<div className="App">
			<div>
				<button onClick={changeColumns}>Change Columns</button>
				<button onClick={onItems}>Fill Items</button>
			</div>
			<div className="tableContainer">
				<VirtualTable ref={setFocus} columns={columns} items={items} position={position} setPosition={setPosition} />
			</div>
		</div>
	)
}

export default App
