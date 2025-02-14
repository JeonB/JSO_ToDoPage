import { DetailsMenuProps } from '@/app/lib/type'

const DetailsMenu = ({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: DetailsMenuProps) => {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-lg p-2 transition-colors hover:bg-neutral-700">
        <span className="material-symbols-outlined text-neutral-400">
          more_vert
        </span>
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-neutral-700 bg-neutral-800 py-2 shadow-lg">
        <button
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-white transition-colors hover:bg-neutral-700"
          onClick={onEdit}>
          <span className="material-symbols-outlined text-indigo-400">
            edit
          </span>
          {editLabel}
        </button>
        <button
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-400 transition-colors hover:bg-neutral-700"
          onClick={onDelete}>
          <span className="material-symbols-outlined">delete</span>
          {deleteLabel}
        </button>
      </div>
    </details>
  )
}

export default DetailsMenu
