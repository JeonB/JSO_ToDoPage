'use client'
import React, { useRef, useState } from 'react'
import DetailsMenu from './DetailsMenu'
import { createTask, deleteBoard, updateBoardName } from '@/app/lib/actions'
import { BoardType } from '@/app/lib/type'
import { useDebouncedCallback } from 'use-debounce'
import TaskList from './TaskList'
import clsx from 'clsx'
import { useSortable } from '@dnd-kit/sortable'

export default function Board({ board }: { board: BoardType }) {
  const [name, setName] = useState(board.name)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedUpdate = useDebouncedCallback(async (newName: string) => {
    if (newName.trim() !== board.name) {
      await updateBoardName({ id: board.id, name: newName, order: board.order })
    }
    setIsEditing(false)
  }, 300)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    debouncedUpdate(newName)
  }

  const handleEdit = () => {
    setIsEditing(true)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!isEditing) {
      e.preventDefault()
    }
  }
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: board.id })

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        transition,
      }
    : undefined
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="w-full flex-shrink-0 rounded-xl border border-neutral-700 bg-neutral-800 p-4 shadow-sm md:w-[300px] lg:w-[350px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">
              format_list_bulleted
            </span>
            <input
              ref={inputRef}
              className={clsx(
                'w-full',
                isEditing ? 'cursor-text' : 'cursor-pointer',
                'bg-transparent',
                'text-lg',
                'font-semibold',
                'text-white',
                'focus:outline-none',
                'md:text-xl',
                'select-none',
              )}
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter new board title"
              readOnly={!isEditing}
              onMouseDown={handleMouseDown}
            />
          </div>
          <DetailsMenu
            editLabel="보드 수정"
            deleteLabel="보드 삭제"
            onEdit={handleEdit}
            onDelete={() => deleteBoard(board.id)}
          />
        </div>
        <div className="space-y-5">
          {board.tasks && board.tasks.length !== 0 && (
            <TaskList tasks={board.tasks} />
          )}
          <button
            onClick={() => createTask(board.id)}
            onPointerDown={e => e.stopPropagation()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-700 px-3 py-2 text-neutral-400 transition-all duration-200 hover:scale-[1.02] hover:border-indigo-500 hover:text-indigo-400">
            <span className="material-symbols-outlined animate-pulse">
              add_circle
            </span>
            할일 추가
          </button>
        </div>
      </div>
    </div>
  )
}
