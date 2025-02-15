import { useEffect, useRef, useState } from 'react'
import { TaskType } from '@/app/lib/type'
import { useDebouncedCallback } from 'use-debounce'
import { updateTaskTitle, deleteTask } from '@/app/lib/actions'
import clsx from 'clsx'

export default function Task({ task }: { task: TaskType }) {
  const [taskTitle, setTaskTitle] = useState<string>(task.title)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const debouncedUpdate = useDebouncedCallback(
    async (taskId: string, newTitle: string) => {
      if (newTitle.trim() && newTitle !== task.title) {
        await updateTaskTitle({ id: taskId, title: newTitle })
      }
      setIsEditing(false)
    },
    300,
  )

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }, [])

  const handleInputChange = (taskId: string, newTitle: string) => {
    setTaskTitle(newTitle)
    debouncedUpdate(taskId, newTitle)

    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (!isEditing) {
      e.preventDefault()
    }
  }
  return (
    <div
      className="relative flex items-start"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <textarea
        ref={inputRef}
        value={taskTitle}
        onChange={e => handleInputChange(task.id, e.target.value)}
        className={clsx(
          isEditing ? 'cursor-text' : 'cursor-pointer',
          'w-full',
          'resize-none',
          'appearance-none',
          'overflow-hidden',
          'rounded-lg',
          'border-none',
          'bg-neutral-700',
          'p-2',
          'text-white',
          'hover:shadow-lg',
          'focus:outline-none',
        )}
        rows={1}
        readOnly={!isEditing}
        onMouseDown={handleMouseDown}
      />
      {isHovered && (
        <div className="absolute right-0 top-0 z-10">
          <div className="flex w-fit flex-row p-1">
            <button
              className="flex w-full cursor-pointer items-center rounded-sm py-1 text-left text-white transition-colors hover:bg-neutral-800"
              onClick={handleEdit}>
              <span className="material-symbols-outlined text-indigo-400">
                edit
              </span>
            </button>
            <button
              className="flex w-full items-center rounded-sm py-1 text-left text-red-400 transition-colors hover:bg-neutral-800"
              onClick={() => deleteTask(task.id)}>
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
