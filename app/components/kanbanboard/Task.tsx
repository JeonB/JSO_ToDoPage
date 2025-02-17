import { useEffect, useRef, useState } from 'react'
import { TaskType } from '@/app/lib/type'
import { useDebouncedCallback } from 'use-debounce'
import { updateTaskTitle, deleteTask } from '@/app/lib/actions'
import clsx from 'clsx'
import { useSortable } from '@dnd-kit/sortable'

export default function Task({
  task,
  onChange,
  autoFocus = false,
}: {
  task: TaskType
  onChange: (taskId: string, newTitle: string) => void
  autoFocus?: boolean
}) {
  const [taskTitle, setTaskTitle] = useState<string>(task.title || '')
  const [isEditing, setIsEditing] = useState(autoFocus)
  const [isFocused, setIsFocused] = useState(autoFocus)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const buttonContainerRef = useRef<HTMLDivElement>(null)
  const isHoveredRef = useRef(false)

  const debouncedUpdate = useDebouncedCallback(
    async (taskId: string, newTitle: string) => {
      if (newTitle.trim() && newTitle) {
        await updateTaskTitle({
          id: taskId,
          title: newTitle,
          order: task.order,
        })
      }
    },
    500,
  )

  const handleInputChange = (newTitle: string) => {
    setTaskTitle(newTitle)
    onChange(task.id, newTitle)
    debouncedUpdate(task.id, newTitle)
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const updatedTitle = taskTitle.trim()

      if (updatedTitle) {
        setTaskTitle(updatedTitle)
        onChange(task.id, updatedTitle)
        setIsEditing(false)

        await updateTaskTitle({
          id: task.id,
          title: updatedTitle,
          order: task.order,
        })
      }
    }
  }

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [taskTitle])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      adjustTextareaHeight()
    }
  }, [isEditing])

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
      setIsFocused(false)
    }
  }, [isFocused])

  useEffect(() => {
    setTaskTitle(task.title || '')
  }, [task.title])

  const handleMouseOver = () => {
    if (!isHoveredRef.current && buttonContainerRef.current) {
      isHoveredRef.current = true
      buttonContainerRef.current.style.display = 'flex'
    }
  }

  const handleMouseLeave = () => {
    if (isHoveredRef.current && buttonContainerRef.current) {
      isHoveredRef.current = false
      buttonContainerRef.current.style.display = 'none'
    }
  }

  const handleEdit = () => {
    setIsEditing(false)
    setTimeout(() => setIsEditing(true), 100)
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        transition,
      }
    : undefined

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsEditing(false)
      }
    }

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing])

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(isDragging && 'opacity-50')}>
      <div
        className="relative flex items-start"
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}>
        <textarea
          ref={inputRef}
          value={taskTitle}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={clsx(
            isEditing ? 'cursor-text' : 'cursor-pointer',
            'w-full',
            'resize-none',
            'appearance-none',
            'overflow-hidden',
            'rounded-lg',
            'dark:bg-neutral-700',
            'bg-neutral-100',
            'shadow-md',
            'p-2',
            'dark:text-white',
            'text-black',
            'hover:shadow-lg',
            'drop-shadow-sm',
            'focus:outline-none',
          )}
          rows={1}
          readOnly={!isEditing}
        />
        <div
          ref={buttonContainerRef}
          className="absolute right-0 top-0 z-10 hidden">
          <div className="flex w-fit flex-row p-1">
            <button
              onPointerDown={e => e.stopPropagation()}
              className="flex w-full cursor-pointer items-center rounded-sm py-1 text-left text-white transition-colors hover:bg-indigo-300 dark:hover:bg-neutral-800"
              onClick={handleEdit}>
              <span className="material-symbols-outlined text-indigo-400">
                edit
              </span>
            </button>
            <button
              onPointerDown={e => e.stopPropagation()}
              className="flex w-full items-center rounded-sm py-1 text-left text-red-400 transition-colors hover:bg-indigo-300 dark:hover:bg-neutral-800"
              onClick={() => deleteTask(task.id)}>
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
