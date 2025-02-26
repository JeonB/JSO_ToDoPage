import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { TaskType } from '@/app/lib/type'
import { useDebouncedCallback } from 'use-debounce'
import { updateTaskTitle, deleteTask } from '@/app/lib/actions'
import clsx from 'clsx'

const TaskTest = memo(
  function Task({
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
    const localTitleRef = useRef(task.title) // 🔥 useRef로 title 값 관리 (리렌더링 방지)
    const [isEditing, setIsEditing] = useState(autoFocus)

    // 🔥 백엔드 업데이트는 500ms로 유지
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

    // 🔥 프론트엔드 상태 업데이트는 3초 지연
    const debouncedUpdateFrontend = useDebouncedCallback(
      (taskId: string, newTitle: string) => {
        onChange(taskId, newTitle) // 🔥 3초 후 boardList 상태 업데이트 (리렌더링 유발)
      },
      3000,
    )

    // 🔥 입력 값 변경 시 즉시 UI에는 반영하지만, 상태는 업데이트하지 않음
    const handleInputChange = useCallback(
      (newTitle: string) => {
        localTitleRef.current = newTitle // 🔥 useRef를 사용해 값만 변경 (리렌더링 방지)
        if (inputRef.current) {
          inputRef.current.value = newTitle // 🔥 UI 즉시 반영 (상태 업데이트 없음)
        }
        debouncedUpdateBackend(task.id, newTitle) // 🔥 백엔드 500ms 업데이트
        debouncedUpdateFrontend(task.id, newTitle) // 🔥 프론트엔드 3초 업데이트
      },
      [task.id, debouncedUpdateBackend, debouncedUpdateFrontend],
    )

    // 🔥 Enter 키 처리
    const handleKeyDown = useCallback(
      async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
      },
      [task.id, task.order],
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
          defaultValue={task.title} // 🔥 초기값만 설정 (useState 제거)
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={adjustTextareaHeight}
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
  },
  (prevProps, nextProps) => {
    return prevProps.task.title === nextProps.task.title // task의 title이 변경되지 않았으면 리렌더링 방지
  },
)

export default TaskTest
