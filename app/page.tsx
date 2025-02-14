import Board from '@/components/kanbanboard/Board'
import { BoardType } from './lib/type'
export default async function MyKanbanBoard() {
  const boards: BoardType[] = await getBoards()
  return (
    <div>
      <div className="min-h-[600px] w-full rounded-xl bg-neutral-900 p-4 shadow-lg transition-colors duration-300 md:p-6 dark:bg-neutral-900">
        <header className="mb-6 flex flex-col items-start justify-between gap-4 md:mb-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-indigo-400">
              dashboard_customize
            </span>
            <h1 className="text-xl font-bold text-white md:text-2xl">
              Kanban Board
            </h1>
          </div>
          <div className="flex w-full items-center gap-4 md:w-auto">
            <button className="rounded-lg bg-neutral-800 p-2 text-white transition-colors duration-200 hover:bg-neutral-700">
              <span className="material-symbols-outlined">dark_mode</span>
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-indigo-700 md:flex-none">
              <span className="material-symbols-outlined animate-pulse">
                add_circle
              </span>
              New Board
            </button>
          </div>
        </header>
        {boards.map(board => (
          <Board key={board.id} board={board} />
        ))}
      </div>
    </div>
  )
}
