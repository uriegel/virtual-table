import React from 'react'

const minScrollbarGripSize = 20

export interface ScrollbarProp {
    count: number
    displayCount: number
    headerHeight: number
    scrollbarHeight: number
    scrollPosition: number
    setScrollPosition: (pos: number)=>void
}

export const Scrollbar = ({ count, displayCount, headerHeight, scrollbarHeight,
        scrollPosition, setScrollPosition }: ScrollbarProp) => {
    const range = Math.max(0, count - displayCount) + 1
    const gripHeight = Math.max(scrollbarHeight * (displayCount / count || 1), minScrollbarGripSize)
    const scrollbarGripTop = (scrollbarHeight - gripHeight) * (scrollPosition / range) 

    const getGripTop = () => 
        (scrollbarHeight - gripHeight) * (scrollPosition / (range - 1))

    const mouseRepeat = (action: (pos: number)=>void) => {
        action(scrollPosition)
        let interval = 0
        const timeout = setTimeout(() => interval = setInterval(action, 50), 600)
        const mouseUp = () => {
            window.removeEventListener("mouseup", mouseUp)
            clearTimeout(timeout)
            if (interval)
                clearInterval(interval)
        }
        window.addEventListener("mouseup", mouseUp)
    }

    const onPageMouseDown = (revt: React.MouseEvent) => {
		let newPosition = scrollPosition
		const evt = revt.nativeEvent
		const isUp = evt.offsetY <= getGripTop()
		const action = isUp 
			? () => {
				const gripTop = getGripTop()
				if (evt.offsetY < gripTop)
					newPosition -= displayCount - 1
                setScrollPosition(Math.max(newPosition, 0))
			}
			: () => {
				const gripTop = getGripTop()
				if (evt.offsetY > gripTop + gripHeight)
					newPosition += displayCount - 1
                setScrollPosition(Math.min(range -1, newPosition))
			}
		mouseRepeat(action)
	}

    const onGripDown = (revt: React.MouseEvent) => {
		const evt = revt.nativeEvent
        const pixelRange = scrollbarHeight - gripHeight + 1

		const gripTop = getGripTop()
        const startPos = evt.y - gripTop

        const maxPosition = count - displayCount + 1
		const onmove = (evt: globalThis.MouseEvent) => {
            const delta = evt.y - startPos
            if (pixelRange) {
                const factor = Math.min(1, (Math.max(0, delta * 1.0 / pixelRange)))
                setScrollPosition(Math.floor(factor * maxPosition))
            }
			evt.preventDefault()
			evt.stopPropagation()
		}
		const onup = () => {
			window.removeEventListener('mousemove', onmove, true)
			window.removeEventListener('mouseup', onup, true)
		}
		window.addEventListener('mousemove', onmove, true)
		window.addEventListener('mouseup', onup, true)

		revt.stopPropagation()
    }

    return (
        <div 
            className={`vtr--scrollbar ${count < displayCount ? 'hidden' : ''}`}
            style={{ top: `${headerHeight}px`, height: `calc(100% - ${headerHeight}px)` }}
            onMouseDown={onPageMouseDown} >
            <div className={"vtr--scrollbar-grid"}
                style={{ top: `${scrollbarGripTop}px`, height: `${gripHeight}px` }}
                onMouseDown={onGripDown}>
            </div>
        </div>
)} 
