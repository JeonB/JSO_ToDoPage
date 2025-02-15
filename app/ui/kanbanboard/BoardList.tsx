'use client'
import { BoardType } from '@/app/lib/type'
import Board from './Board'
import { createBoard } from '@/app/lib/actions'

export default function BoardList({ boards }: { boards: BoardType[] }) {
  return (
    <div className="flex flex-col gap-4 pb-4 md:flex-row md:gap-6 md:overflow-x-auto">
      {boards.map(board => (
        <Board key={board.id} board={board} />
      ))}

      <button
        onClick={() => createBoard()}
        className="flex h-[200px] w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-700 text-neutral-400 transition-all duration-200 hover:border-indigo-500 hover:text-indigo-400 md:w-[300px] lg:w-[350px]">
        <span className="material-symbols-outlined animate-pulse">
          add_circle
        </span>
        새 페이지
      </button>
    </div>
  )
}
