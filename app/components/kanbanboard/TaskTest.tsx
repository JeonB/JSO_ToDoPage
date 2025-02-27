import { memo, useRef } from 'react'
import { TaskType } from '@/app/lib/type'
import { deleteTask } from '@/app/lib/actions'
import clsx from 'clsx'
import useTaskInput from '@/app/hooks/useTaskInput'
import useClickOutside from '@/app/hooks/useClickOutside'
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

    const buttonContainerRef = useRef<HTMLDivElement>(null)
    const {
      inputRef,
      isEditing,
      setIsEditing,
      handleInputChange,
      handleKeyDown,
      handleEdit,
    } = useTaskInput(task, onChange)

    // useClickOutside(inputRef, () => setIsEditing(false), isEditing)

    return (
      <div
        className="relative flex touch-none items-start"
        onMouseOver={() => (buttonContainerRef.current!.style.display = 'flex')}
        onMouseLeave={() =>
          (buttonContainerRef.current!.style.display = 'none')
        }>
        <textarea
          data-no-dnd={isEditing ? 'true' : undefined}
          autoFocus={autoFocus}
          ref={inputRef}
          defaultValue={task.title}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={clsx(
            isEditing ? 'cursor-text' : 'cursor-pointer',
            'w-full resize-none appearance-none overflow-hidden rounded-lg bg-neutral-100 p-2 text-black shadow-md drop-shadow-sm hover:shadow-lg focus:outline-none dark:bg-neutral-700 dark:text-white',
          )}
          rows={1}
          readOnly={!isEditing && !autoFocus}
          onBlur={() => setIsEditing(false)}
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
  (prevProps, nextProps) => prevProps.task.title === nextProps.task.title,
)

export default TaskTest
