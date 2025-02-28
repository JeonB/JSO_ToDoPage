import { createBoard } from '@/app/lib/actions'

export default function AddBoardButton({
  onBoardCreated,
}: {
  onBoardCreated: (boardId: string) => void
}) {
  const handleAddBoard = async () => {
    try {
      const newBoard_id = await createBoard()
      onBoardCreated(newBoard_id)
    } catch (error) {
      console.error('보드 추가 실패:', error)
    }
  }
  return (
    <button
      onClick={handleAddBoard}
      className="flex h-[200px] w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 text-neutral-400 transition-all duration-200 hover:border-indigo-500 hover:text-indigo-400 dark:border-neutral-700 md:w-[300px] lg:w-[350px]">
      <span className="material-symbols-outlined animate-pulse">
        add_circle
      </span>
      새 페이지
    </button>
  )
}
