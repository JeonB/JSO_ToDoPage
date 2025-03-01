import { useState, useRef } from 'react'
import { DetailsMenuProps } from '@/app/lib/type'

const DetailsMenu = ({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: DetailsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleBlur = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 100)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    e.stopPropagation()
  }

  return (
    <div className="relative">
      <button
        onBlur={handleBlur}
        onPointerDown={handlePointerDown}
        className="cursor-pointer list-none rounded-lg p-2 transition-colors hover:bg-indigo-100 dark:hover:bg-neutral-700"
        onClick={() => setIsOpen(!isOpen)}>
        <span className="material-symbols-outlined text-neutral-400">
          more_vert
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-32 rounded-lg border border-neutral-300 bg-white py-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          <button
            onPointerDown={handlePointerDown}
            className="flex w-full items-center gap-2 px-2 py-2 text-indigo-400 transition-colors hover:bg-indigo-100 dark:hover:bg-neutral-700"
            onClick={onEdit}>
            <span className="material-symbols-outlined text-indigo-400">
              edit
            </span>
            {editLabel}
          </button>
          <button
            onPointerDown={handlePointerDown}
            className="flex w-full items-center gap-2 px-2 py-2 text-red-400 transition-colors hover:bg-indigo-100 dark:hover:bg-neutral-700"
            onClick={onDelete}>
            <span className="material-symbols-outlined">delete</span>
            {deleteLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export default DetailsMenu
