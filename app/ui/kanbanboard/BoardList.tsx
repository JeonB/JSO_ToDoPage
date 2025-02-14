import { BoardType } from '@/app/lib/type'
import Board from './Board'

export default function BoardList({ boards }: { boards: BoardType[] }) {
  return (
    <div className="flex flex-col gap-4 pb-4 md:flex-row md:gap-6 md:overflow-x-auto">
      {boards.map(board => (
        <Board key={board.id} board={board} />
      ))}
      <button className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-700 px-3 py-2 text-neutral-400 transition-all duration-200 hover:scale-[1.02] hover:border-indigo-500 hover:text-indigo-400">
        <span className="material-symbols-outlined animate-pulse">
          add_circle
        </span>
        Add Task
      </button>
    </div>
  )
}
