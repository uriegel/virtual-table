import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import VirtualTable, { Column, OnSort, SetFocusHandle, TableRowItem } from './component/index'

const App = () => {

	const setFocus = useRef<SetFocusHandle>(null)

	const [position, setPosition] = useState(0)
	const [items, setItems] = useState([] as TableRowItem[])
	
	const [columns, setColumns] = useState({
		columns: [] as Column[],
		renderRow: (r: TableRowItem) => [] as (JSX.Element|string)[],
		measureRow: () => "" as JSX.Element|string
	})

	useEffect(() => setFocus.current?.setFocus(), [])
	
	useEffect(() => {
		setColumns({
			columns: [
				{ name: "Name", isSortable: true, subColumn: "Ext." },
				{ name: "Date" },
				{ name: "Details", isRightAligned: true }
			],
			renderRow: ({ index }: TableRowItem) => [
				`Der ${index}. Eintrag`,
				`Datum ${index}`,
				`Der ${index}. Eintrag in der 3. Spalte`
			],
			measureRow: () => `Measure`
		})

		const items = [...Array(20).keys()].map(n => ({index: n})) as TableRowItem[]
		setItems(items)
	}, [setColumns, setItems])
	
	function changeColumns() {
		setPosition(0)
		setItems([])		
		setColumns({
			columns: [
				{ name: "Name", isSortable: true },
				{ name: "Neue Spalte 1" },
				{ name: "Neue Spalte 2", isSortable: true, isRightAligned: true },
				{ name: "Neue Spalte 3" }
			],
			renderRow: ({ index }: TableRowItem) => [
				`Der ${index}. Eintrag`,
				`Spalte 1 ${index}`,
				`Spalte 2 ${index}`,
				`Spalte 3 ${index}`,
			],
			measureRow: () => (<td>{`Measure`}</td>)
		})
	}

	function onItems() {
		const items = [...Array(2000).keys()].map(n => ({index: n})) as TableRowItem[]
		setItems(items)
		setFocus.current?.setFocus()
	}

	const onSort = (sort: OnSort) => console.log("onSort", sort)

	return (
		<div className="App">
			<div>
				<button onClick={changeColumns}>Change Columns</button>
				<button onClick={onItems}>Fill Items</button>
			</div>
			<div className="tableContainer">
				<VirtualTable ref={setFocus} columns={columns} items={items} position={position} setPosition={setPosition} onSort={onSort} />
			</div>
		</div>
	)
}

export default App
