import React, { useEffect, KeyboardEvent, useRef, useState } from 'react'
import './App.css'
import VirtualTable, { OnSort, VirtualTableHandle, TableRowItem, createEmptyHandle } from './component/index'

const App = () => {

	const virtualTable = useRef<VirtualTableHandle>(createEmptyHandle())

	const [items, setItems] = useState([] as TableRowItem[])
	
	useEffect(() => virtualTable.current.setFocus(), [])
	
	useEffect(() => {
		virtualTable.current.setColumns({
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

		const items = [...Array(30).keys()].map(n => ({index: n})) as TableRowItem[]
		setItems(items)
	}, [setItems])
	
	function changeColumns() {
		setItems([])		
		const widths = JSON.parse(localStorage.getItem("widths") ?? "[]") as number[]
		console.log("witdhs",widths)
		virtualTable.current.setColumns({
			columns: [
				{ name: "Name", isSortable: true, width: widths.length == 4 ? widths[0] : undefined },
				{ name: "Neue Spalte 1", width: widths.length == 4 ? widths[1] : undefined },
				{ name: "Neue Spalte 2", isSortable: true, isRightAligned: true, width: widths.length == 4 ? widths[2] : undefined },
				{ name: "Neue Spalte 3", width: widths.length == 4 ? widths[3] : undefined }
			],
			renderRow: ({ index }: TableRowItem) => [
				`Der ${index}. Eintrag`,
				(
					<>
						<span>{`Spalte 1 ${index}`}</span>
						<span>2. span</span>
					</>
				),
				`Spalte 2 ${index}`,
				`Spalte 3 ${index}`,
			],
			measureRow: () => (<td>{`Measure`}</td>)
		})
	}

	function onItems() {
		const items = [...Array(2000).keys()].map(n => ({index: n})) as TableRowItem[]
		setItems(items)
		virtualTable.current.setFocus()
	}

	const onSort = (sort: OnSort) => console.log("onSort", sort)

	const toggleSelection = (item: TableRowItem) => {
		item.isSelected = !item.isSelected
		return item
	}

	const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		// console.log("onKeyDown", e)		        
		switch (e.code) {
			case "Insert":
				setItems(items.map((n, i) => i != virtualTable.current.getPosition() ? n : toggleSelection(n)))
				virtualTable.current?.setPosition(virtualTable.current.getPosition() + 1)
                e.preventDefault()
                e.stopPropagation()
				break
		}
	}

	const setWidths = (widths: number[]) => {
		if (widths.length == 4)
			localStorage.setItem("widths", JSON.stringify(widths))
	} 

	return (
		<div className="App" onKeyDown={onKeyDown}>
			<div>
				<button onClick={changeColumns}>Change Columns</button>
				<button onClick={onItems}>Fill Items</button>
			</div>
			<div className="tableContainer">
				<VirtualTable ref={virtualTable} items={items} onSort={onSort} onColumnWidths={setWidths} />
			</div>
		</div>
	)
}

export default App
