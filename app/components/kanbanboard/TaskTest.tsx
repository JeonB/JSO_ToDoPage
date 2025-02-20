import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { TaskType } from '@/app/lib/type'
import { useDebouncedCallback } from 'use-debounce'
import { updateTaskTitle, deleteTask } from '@/app/lib/actions'
import clsx from 'clsx'

const TaskTest = memo(function Task({
  task,
  onChange,
  autoFocus = false,
}: {
  task: TaskType
  onChange: (taskId: string, newTitle: string) => void
  autoFocus?: boolean
}) {
  console.log('Task render:', task.id, 'autoFocus:', autoFocus)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const buttonContainerRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(autoFocus)

  // 🔥 autoFocus 처리: 처음 렌더링될 때만 적용
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [autoFocus])

  // 🔥 Debounce API 호출 최적화
  const debouncedUpdate = useDebouncedCallback(
    async (taskId: string, newTitle: string) => {
      if (newTitle.trim()) {
        await updateTaskTitle({
          id: taskId,
          title: newTitle,
          order: task.order,
        })
      }
    },
    500,
  )

  // 🔥 handleInputChange 최적화
  const handleInputChange = useCallback(
    (newTitle: string) => {
      onChange(task.id, newTitle)
      debouncedUpdate(task.id, newTitle)
    },
    [task.id, debouncedUpdate, onChange],
  )

  // 🔥 Enter 키 처리
  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const updatedTitle = task.title?.trim()

        if (updatedTitle) {
          setIsEditing(false)
          await updateTaskTitle({
            id: task.id,
            title: updatedTitle,
            order: task.order,
          })
        }
      }
    },
    [task],
  )

  // 🔥 textarea 자동 높이 조절
  const adjustTextareaHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [])

  // 🔥 수정 버튼 클릭 시 편집 모드 활성화
  const handleEdit = useCallback(() => {
    setIsEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  // 🔥 버튼 컨테이너 보이기/숨기기
  const handleMouseOver = () => {
    if (buttonContainerRef.current) {
      buttonContainerRef.current.style.display = 'flex'
    }
  }

  const handleMouseLeave = () => {
    if (buttonContainerRef.current) {
      buttonContainerRef.current.style.display = 'none'
    }
  }

  return (
    <div
      className="relative flex items-start"
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}>
      <textarea
        ref={inputRef}
        defaultValue={task.title} // 🔥 useState 제거하고 직접 props 사용
        onChange={e => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={adjustTextareaHeight} // 🔥 useEffect 제거, onInput 이벤트로 높이 조절
        className={clsx(
          isEditing ? 'cursor-text' : 'cursor-pointer',
          'w-full resize-none appearance-none overflow-hidden rounded-lg bg-neutral-100 p-2 text-black shadow-md drop-shadow-sm hover:shadow-lg focus:outline-none dark:bg-neutral-700 dark:text-white',
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
  )
})

export default TaskTest
