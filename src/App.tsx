import { useEffect, KeyboardEvent, useRef, useState } from 'react'
import './App.css'
import VirtualTable, { OnSort, VirtualTableHandle, SpecialKeys, SelectableItem } from './component/index'

enum Kind {
	Value,
	Object,
	Array
}

const getKind = (item: any) => 
	Array.isArray(item)
	? Kind.Array
	: item instanceof Object
	? Kind.Object
	: Kind.Value
	

interface FolderItem extends SelectableItem {
	name: string
	key?: string
	value?: string
	kind?: Kind
	opened?: boolean
	depth?: number
}

type Data = {
    [key: string]: any
}

const object: Data = {
	name: "Kemal Ceylan",
	age: 27,
	contact: {
		name: "PQ",
		id: "I-123",
		number: 451,
		wahr: true,
		falsch: false
	},
	familiy: [
		"father",
		"mother",
		"cat"
	],
	partnerlist: [
		{
			name: "Burhan",
			number: "539"
		}, {
			name: "Birgit",
			number: "654"
		}
	]
}

let dragEnterRefs = 0

const App = () => {

	const virtualTable = useRef<VirtualTableHandle<FolderItem>>(null)

	const [items, setItems] = useState([] as FolderItem[])
	const [dragStarted, setDragStarted] = useState(false)
	const [dragging, setDragging] = useState(false)

	const expandedRows = useRef(new Set())

	useEffect(() => virtualTable.current?.setFocus(), [])
	
	useEffect(() => {
		virtualTable.current?.setColumns({
			columns: [
				{ name: "Name", isSortable: true, subColumn: "Ext." },
				{
					name: "Date", isSortable: true, renderColumn: (n, click) => (
						<>
							<span className={"opener"} onClick={e => click(e, 234)}>+</span>
							<span className={"columnClass"}>{`custom: ${n}`}</span>
						</>
						
					)
				},
				{ name: "Details", isRightAligned: true }
			],
			renderRow: ({ name }: FolderItem) => [
				name,
				`Datum`,
				`Der Eintrag in der 3. Spalte`
			],
			draggable: true,
			getRowClasses: item => item.name == "Name: 4" ? ["invisible"] : []
		})

		const items = [...Array(30).keys()].map(n => ({index: n, name: `Name: ${n}`})) as FolderItem[]
		setItems(items)
	}, [setItems])
	
	const objectToItems = (object: Data, parentKey = "", depth = 0): FolderItem[] => 
		Object.entries(object).flatMap(([key, value]) => {
			const kind = getKind(value)
			const opened = kind !== Kind.Value ? expandedRows.current.has(parentKey + key) : false
			return ([{
				name: key,
				key: parentKey + key,
				value: kind === Kind.Value ? String(value) : "",
				kind,
				opened,
				depth
			}] as FolderItem[]).concat(opened ? objectToItems(value, key, depth + 1) : [])
		})  

	function changeColumns() {
		setItems([])		
		const widths = JSON.parse(localStorage.getItem("widths") ?? "[]") as number[]
		virtualTable.current?.setColumns({
			columns: [
				{ name: "Name", isSortable: true, width: widths.length == 4 ? widths[0] : undefined },
				{ name: "Neue Spalte 1", width: widths.length == 4 ? widths[1] : undefined },
				{ name: "Neue Spalte 2", isSortable: true, isRightAligned: true, width: widths.length == 4 ? widths[2] : undefined },
				{ name: "Neue Spalte 3", width: widths.length == 4 ? widths[3] : undefined }
			],
			renderRow: ({ name }: FolderItem) => [
				name,
				(
					<>
						<span>Span1 und</span>
						<span>2. span</span>
					</>
				),
				`Spalte 2`,
				`Spalte 3`,
			]
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

	function onItems3() {

		virtualTable.current?.setColumns({
			columns: [
				{ name: "Name" },
			],
			renderRow: ({ name }: FolderItem) => [
				(
					<div className="card" >
						<div>{name}</div>
					</div>
				)
			],
			withoutHead: true
		})		
		const items = [...Array(70).keys()].map(n => ({index: n, name: `Name: ${n}`})) as FolderItem[]
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
		switch (e.key) {
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

	const onEnter = (item: FolderItem, _: SpecialKeys, mouseActivated?: boolean) => !mouseActivated && toggleItem(item)

	const onItemClick = (item: FolderItem) => toggleItem(item)

	const toggleItem = (item: FolderItem) => {
		if (expandedRows.current.has(item.key))
			expandedRows.current.delete(item.key)
		else {
			expandedRows.current.add(item.key)
		}
		setItems(objectToItems(object))
	}

	const onPosition = (item: FolderItem, pos?: number) => console.log("on item changed", item, pos)

	const onDragStart = (evt: React.DragEvent) => {
		evt.dataTransfer?.setData("internalCopy", "true")
		setDragStarted(true)
	}
	
	const onDragEnd = () => setDragStarted(false)

	const onObjectView = () => {
		setItems([])		
		virtualTable.current?.setColumns({
			columns: [
				{ name: "Key", isSortable: true },
				{ name: "Value" }
			],
			renderRow: (value: FolderItem, click) => [
				(<>
					{[...Array(value.depth).keys()].map(() => <span className='depth'></span>)}
					<div className={`itemNode${(value.kind === Kind.Value ? " none" : "")}${value.opened ? " opened" : ""}`}
						onClick={value.kind !== Kind.Value ? () => click && click(1) : () => { }}>
						<div></div>
					</div>
					<span>
						{ value.name}
					</span>
				</>),
				value.value ?? ""
			]
		})
		setItems(objectToItems(object))
	}

	const onColumnClick = (id: number) => console.log("Column was clicked", id)

    const onDragEnter = () => {
		dragEnterRefs++
        setDragging(true)
		console.log("drag enter", dragEnterRefs)
    }

    const onDragLeave = () => {
		if (--dragEnterRefs == 0)
			setDragging(false)
		console.log("drag leave", dragEnterRefs)
    }        
			
	return (
		<div className={`App${dragging ? " dragging": ""}`} onKeyDown={onKeyDown} onDragEnter={onDragEnter} onDragLeave={onDragLeave}>
			<div>
				<button tabIndex={1} onClick={changeColumns}>Change Columns</button>
				<button tabIndex={2} onClick={onItems}>Fill Items</button>
				<button tabIndex={3} onClick={onItems2}>Fill Items 2</button>
				<button tabIndex={5} onClick={onItems3}>Card view</button>
				<button tabIndex={6} onClick={onObjectView}>Object View</button>
			</div>
			<div className={`tableContainer${dragStarted ? " dragStarted" : ""}`}>
				<VirtualTable ref={virtualTable} items={items} onSort={onSort} tabIndex={4} onDragStart={onDragStart} onDragEnd={onDragEnd}
					onColumnWidths={setWidths} onEnter={onEnter} onPosition={onPosition} onClick={onItemClick} onColumnClick={onColumnClick}/>
			</div>
		</div>
	)
}
export default App
// TODO don't inherit from TableRowTtem