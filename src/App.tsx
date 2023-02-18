import { useEffect, KeyboardEvent, useRef, useState } from 'react'
import './App.css'
import VirtualTable, { OnSort, VirtualTableHandle, TableRowItem, SpecialKeys } from './component/index'

interface FolderItem extends TableRowItem {
	name: string
}

const App = () => {

	const virtualTable = useRef<VirtualTableHandle<FolderItem>>(null)

	const [items, setItems] = useState([] as FolderItem[])
	
	useEffect(() => virtualTable.current?.setFocus(), [])
	
	useEffect(() => {
		virtualTable.current?.setColumns({
			columns: [
				{ name: "Name", isSortable: true, subColumn: "Ext." },
				{ name: "Date" },
				{ name: "Details", isRightAligned: true }
			],
			renderRow: ({ index, name }: FolderItem) => [
				name,
				`Datum ${index}`,
				`Der ${index}. Eintrag in der 3. Spalte`
			],
			getRowClasses: item => item.index == 4 ? ["invisible"] : [],
			measureRow: () => `Measure`
		})

		const items = [...Array(30).keys()].map(n => ({index: n, name: `Name: ${n}`})) as FolderItem[]
		setItems(items)
	}, [setItems])
	
	function changeColumns() {
		setItems([])		
		const widths = JSON.parse(localStorage.getItem("widths") ?? "[]") as number[]
		console.log("witdhs",widths)
		virtualTable.current?.setColumns({
			columns: [
				{ name: "Name", isSortable: true, width: widths.length == 4 ? widths[0] : undefined },
				{ name: "Neue Spalte 1", width: widths.length == 4 ? widths[1] : undefined },
				{ name: "Neue Spalte 2", isSortable: true, isRightAligned: true, width: widths.length == 4 ? widths[2] : undefined },
				{ name: "Neue Spalte 3", width: widths.length == 4 ? widths[3] : undefined }
			],
			renderRow: ({ index, name }: FolderItem) => [
				`Der ${index}. Eintrag`,
				(
					<>
						<span>{name}</span>
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
		const items = [...Array(2000).keys()].map(n => ({index: n, name: `Name: ${n}`})) as FolderItem[]
		setItems(items)
		virtualTable.current?.setInitialPosition(200, items.length)
		virtualTable.current?.setFocus()
	}

	function onItems2() {
		const items = [...Array(7).keys()].map(n => ({index: n, name: `Name: ${n}`})) as FolderItem[]
		setItems(items)
		virtualTable.current?.setInitialPosition(0, items.length)
		virtualTable.current?.setFocus()
	}

	const onSort = (sort: OnSort) => console.log("onSort", sort)

	const toggleSelection = (item: FolderItem) => {
		item.isSelected = !item.isSelected
		return item
	}

	const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		switch (e.code) {
			case "Insert":
				setItems(items.map((n, i) => i != virtualTable.current?.getPosition() ? n : toggleSelection(n)))
				virtualTable.current?.setPosition(virtualTable.current?.getPosition() + 1)
                e.preventDefault()
                e.stopPropagation()
				break
		}
	}

	const setWidths = (widths: number[]) => {
		if (widths.length == 4)
			localStorage.setItem("widths", JSON.stringify(widths))
	} 

	const onEnter = (item: FolderItem, keys: SpecialKeys) => {
		console.log("onEnter", item, keys)
	}

	return (
		<div className="App" onKeyDown={onKeyDown}>
			<div>
				<button onClick={changeColumns}>Change Columns</button>
				<button onClick={onItems}>Fill Items</button>
				<button onClick={onItems2}>Fill Items 2</button>
			</div>
			<div className="tableContainer">
				<VirtualTable ref={virtualTable} items={items} onSort={onSort}
					onColumnWidths={setWidths} onEnter={onEnter} />
			</div>
		</div>
	)
}

export default App
