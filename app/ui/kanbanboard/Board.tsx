'use client'
import React, { useState } from 'react'
import DetailsMenu from './DetailsMenu'
import { deleteBoard, updateBoardName } from '@/app/lib/actions'
import { BoardType } from '@/app/lib/type'
import { useDebouncedCallback } from 'use-debounce'
import TaskList from './TaskList'

export default function Board({ board }: { board: BoardType }) {
  const [name, setName] = useState(board.name)

  const debouncedUpdate = useDebouncedCallback(async (newName: string) => {
    setName(newName)
    if (newName.trim() !== board.name) {
      await updateBoardName({ id: board.id, name: newName })
    }
  }, 300)
  return (
    <div>
      <div className="w-full flex-shrink-0 rounded-xl border border-neutral-700 bg-neutral-800 p-4 shadow-sm md:w-[300px] lg:w-[350px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">
              format_list_bulleted
            </span>
            <h2 className="font-semibold text-red-600">
              <input
                type="text"
                value={name}
                onChange={e => debouncedUpdate(e.target.value)}
                placeholder="Enter new board title"
              />
            </h2>
          </div>
          <DetailsMenu
            editLabel="Edit Board"
            deleteLabel="Delete Board"
            onEdit={() => deleteBoard(board.id)}
            onDelete={() => deleteBoard(board.id)}
          />
          {board.tasks && board.tasks.length !== 0 && (
            <TaskList tasks={board.tasks} />
          )}
        </div>
      </div>
    </div>
  )
}
