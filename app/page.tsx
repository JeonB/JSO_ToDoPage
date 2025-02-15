import Header from './ui/layout/Header'
import { getBoards } from './lib/data'
import BoardList from './ui/kanbanboard/BoardList'

export default async function MyKanbanBoard() {
  const boards = await getBoards()
  boards.sort((a, b) => a.order - b.order)
  return (
    <div className="select-none">
      <div className="min-h-[600px] w-full rounded-xl bg-slate-100 p-4 shadow-lg transition-colors duration-300 md:p-6 dark:bg-neutral-900">
        <Header />
        <BoardList boards={boards} />
      </div>
    </div>
  )
}
