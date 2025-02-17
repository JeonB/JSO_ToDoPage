import { createBoard } from '@/app/lib/actions'

export default function AddBoardButton({
  onBoardCreated,
}: {
  onBoardCreated: (boardId: string) => void
}) {
  const handleAddBoard = async () => {
    const newBoard_id = await createBoard()
    if (newBoard_id) {
      onBoardCreated(newBoard_id)
    }
  }
  return (
    <button
      onClick={handleAddBoard}
      className="flex h-[200px] w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 text-neutral-400 transition-all duration-200 hover:border-indigo-500 hover:text-indigo-400 md:w-[300px] lg:w-[350px] dark:border-neutral-700">
      <span className="material-symbols-outlined animate-pulse">
        add_circle
      </span>
      새 페이지
    </button>
  )
}
