'use client'
import { BoardType } from '@/app/lib/type'
import { createBoard, updateBoardOrder } from '@/app/lib/actions'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useState, useEffect } from 'react'
import Board from './Board'

export default function BoardList({ boards }: { boards: BoardType[] }) {
  const [boardList, setBoardList] = useState<BoardType[]>([])

  useEffect(() => {
    setBoardList(boards)
  }, [boards])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = boardList.findIndex(board => board.id === active.id)
    const newIndex = boardList.findIndex(board => board.id === over.id)
    const newItems = arrayMove(boardList, oldIndex, newIndex)

    setBoardList(newItems)

    await Promise.all(
      newItems.map((board, index) => updateBoardOrder(board.id, index)),
    )
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}>
      <SortableContext
        strategy={horizontalListSortingStrategy}
        items={boardList.map(board => board.id)}>
        <div className="flex flex-col gap-4 pb-4 md:flex-row md:gap-6 md:overflow-x-auto">
          {boardList.map(board => (
            <Board key={board.id} board={board} />
          ))}

          <button
            onClick={() => createBoard()}
            className="flex h-[200px] w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-700 text-neutral-400 transition-all duration-200 hover:border-indigo-500 hover:text-indigo-400 md:w-[300px] lg:w-[350px]">
            <span className="material-symbols-outlined animate-pulse">
              add_circle
            </span>
            새 페이지
          </button>
        </div>
      </SortableContext>
    </DndContext>
  )
}
