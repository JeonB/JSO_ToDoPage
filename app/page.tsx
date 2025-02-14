import Header from './ui/layout/Header'
import { getBoards } from './lib/data'
import BoardList from './ui/kanbanboard/BoardList'
import { BoardType } from './lib/type'
export default async function MyKanbanBoard() {
  const boards = await getBoards()
  const convertedBoard = boards as unknown as BoardType[]
  return (
    <div>
      <div className="min-h-[600px] w-full rounded-xl bg-neutral-900 p-4 shadow-lg transition-colors duration-300 md:p-6 dark:bg-neutral-900">
        <Header />
        <BoardList boards={boards} />
      </div>
    </div>
  )
}
