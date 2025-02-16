import { useState, useEffect, useRef } from 'react'
import { DetailsMenuProps } from '@/app/lib/type'

const DetailsMenu = ({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: DetailsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const detailsRef = useRef<HTMLDivElement>(null)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      detailsRef.current &&
      !detailsRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleEdit = () => {
    onEdit()
    setIsOpen(false)
  }

  const handleDelete = () => {
    onDelete()
    setIsOpen(false)
  }

  return (
    <div ref={detailsRef} className="relative">
      <button
        onPointerDown={e => e.stopPropagation()}
        className="cursor-pointer list-none rounded-lg p-2 transition-colors hover:bg-neutral-700"
        onClick={handleToggle}>
        <span className="material-symbols-outlined text-neutral-400">
          more_vert
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-32 rounded-lg border border-neutral-700 bg-neutral-800 py-2 shadow-lg">
          <button
            onPointerDown={e => e.stopPropagation()}
            className="flex w-full items-center gap-2 px-2 py-2 text-white transition-colors hover:bg-neutral-700"
            onClick={handleEdit}>
            <span className="material-symbols-outlined text-indigo-400">
              edit
            </span>
            {editLabel}
          </button>
          <button
            onPointerDown={e => e.stopPropagation()}
            className="flex w-full items-center gap-2 px-2 py-2 text-red-400 transition-colors hover:bg-neutral-700"
            onClick={handleDelete}>
            <span className="material-symbols-outlined">delete</span>
            {deleteLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export default DetailsMenu
