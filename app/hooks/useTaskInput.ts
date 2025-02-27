import { useState, useEffect, useRef, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { updateTaskTitle } from '@/app/lib/actions'
import { TaskType } from '@/app/lib/type'

export default function useTaskInput(
  task: TaskType,
  onChange: (taskId: string, newTitle: string) => void,
) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const localTitleRef = useRef(task.title)
  const [isEditing, setIsEditing] = useState(false)

  const adjustTextareaHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [task.title, adjustTextareaHeight])

  const debouncedUpdateBackend = useDebouncedCallback(
    async (taskId: string, newTitle: string) => {
      if (newTitle.trim() && newTitle !== task.title) {
        await updateTaskTitle({
          id: taskId,
          title: newTitle,
          order: task.order,
        })
      }
    },
    500,
  )

  const debouncedUpdateFrontend = useDebouncedCallback(
    (taskId: string, newTitle: string) => {
      onChange(taskId, newTitle)
    },
    3000,
  )

  const handleInputChange = (newTitle: string) => {
    localTitleRef.current = newTitle
    if (inputRef.current) {
      inputRef.current.value = newTitle
      adjustTextareaHeight()
    }
    debouncedUpdateBackend(task.id, newTitle)
    debouncedUpdateFrontend(task.id, newTitle)
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const updatedTitle = localTitleRef.current?.trim()
      if (updatedTitle) {
        setIsEditing(false)
        await updateTaskTitle({
          id: task.id,
          title: updatedTitle,
          order: task.order,
        })
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

  return {
    inputRef,
    isEditing,
    setIsEditing,
    handleInputChange,
    handleKeyDown,
    handleEdit,
  }
}
