'use client'
import React, { memo, useRef, useState } from 'react'
import DetailsMenu from './DetailsMenu'
import { deleteBoard, updateBoardTitle } from '@/app/lib/actions'
import { BoardType } from '@/app/lib/type'
import { useDebouncedCallback } from 'use-debounce'
import clsx from 'clsx'

interface BoardProps {
  board: BoardType
  children?: React.ReactNode
  autoFocus?: boolean
}
const Board = memo(
  function Board({ board, children, autoFocus }: BoardProps) {
    const [isEditing, setIsEditing] = useState(autoFocus)
    const inputRef = useRef<HTMLInputElement>(null)

    const debouncedUpdate = useDebouncedCallback(
      async (updatedTitle: string) => {
        if (updatedTitle.trim() !== board.title) {
          await updateBoardTitle({
            id: board.id,
            title: updatedTitle,
            order: board.order,
          })
        }
      },
      300,
    )

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value
      if (inputRef.current) {
        inputRef.current.value = newTitle
      }
      debouncedUpdate(newTitle)
    }

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const updatedTitle = inputRef.current?.value
        if (updatedTitle) {
          setIsEditing(false)
          await updateBoardTitle({
            id: board.id,
            title: updatedTitle,
            order: board.order,
          })
          if (inputRef.current) {
            inputRef.current.blur()
          }
        }
      }
    }

    const handleEdit = () => {
      setIsEditing(true)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.setSelectionRange(
            inputRef.current.value.length,
            inputRef.current.value.length,
          )
        }
      }, 0)
    }
    return (
      <div className="w-full flex-shrink-0 rounded-xl border bg-neutral-100 p-4 text-black shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white md:w-[300px] lg:w-[350px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">
              format_list_bulleted
            </span>
            <input
              autoFocus={autoFocus}
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
              onKeyDown={handleKeyDown}
              type="text"
              defaultValue={board.title}
              onChange={handleTitleChange}
              placeholder="보드 제목 입력"
              readOnly={!isEditing}
              onBlur={() => setIsEditing(false)}
            />
          </div>
          <DetailsMenu
            editLabel="보드 수정"
            deleteLabel="보드 삭제"
            onEdit={handleEdit}
            onDelete={() => deleteBoard(board.id)}
          />
        </div>
        <div className="space-y-5">{children}</div>
      </div>
    )
  },
  (prevProps, nextProps) =>
    prevProps.board.title === nextProps.board.title &&
    prevProps.board.tasks === nextProps.board.tasks,
)
export default Board
