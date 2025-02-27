'use client'
import React, { useEffect, useRef, useState } from 'react'
import DetailsMenu from './DetailsMenu'
import { deleteBoard, updateBoardTitle } from '@/app/lib/actions'
import { BoardType } from '@/app/lib/type'
import { useDebouncedCallback } from 'use-debounce'
import clsx from 'clsx'
import { useSortable } from '@dnd-kit/sortable'

function Board({ id, title, order, children, autoFocus }: BoardType) {
  const [boardTitle, setBoardTitle] = useState(title || '')
  const [isEditing, setIsEditing] = useState(autoFocus)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedUpdate = useDebouncedCallback(async (updatedTitle: string) => {
    if (updatedTitle.trim() !== title) {
      await updateBoardTitle({
        id: id,
        title: updatedTitle,
        order: order,
      })
    }
  }, 500)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setBoardTitle(newName)
    debouncedUpdate(newName)
  }

  const handleEdit = () => {
    setIsEditing(true)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!isEditing) {
      e.preventDefault()
    }
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id })

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        transition,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(isDragging && 'opacity-50', 'touch-none')}>
      <div className="w-full flex-shrink-0 touch-none rounded-xl border bg-neutral-100 p-4 text-black shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white md:w-[300px] lg:w-[350px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">
              format_list_bulleted
            </span>
            <input
              data-no-dnd={isEditing ? 'true' : undefined}
              ref={inputRef}
              className={clsx(
                'w-full',
                isEditing ? 'cursor-text' : 'cursor-pointer',
                'bg-transparent',
                'text-lg',
                'font-semibold',
                'dark:text-white',
                'text-black',
                'focus:outline-none',
                'md:text-xl',
                'select-none',
              )}
              type="text"
              value={boardTitle}
              onChange={handleNameChange}
              placeholder="보드 제목 입력"
              readOnly={!isEditing}
              // onMouseDown={handleMouseDown}
              onBlur={handleBlur}
            />
          </div>
          <DetailsMenu
            editLabel="보드 수정"
            deleteLabel="보드 삭제"
            onEdit={handleEdit}
            onDelete={() => deleteBoard(id)}
          />
        </div>
        <div className="space-y-5">{children}</div>
      </div>
    </div>
  )
}
export default React.memo(Board)
