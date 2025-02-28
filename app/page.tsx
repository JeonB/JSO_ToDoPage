import Header from './components/layout/Header'
import { getBoards } from './lib/data'
import BoardList from './components/kanbanboard/BoardList'
import BoardListTest from './components/kanbanboard/BoardListTest'

export default async function MyKanbanBoard() {
  const boards = await getBoards()
  return (
    <div className="select-none">
      <div className="min-h-[600px] w-full rounded-xl bg-gray-300 p-4 shadow-lg transition-colors duration-300 dark:bg-neutral-900 md:p-6">
        <Header />
        {/* <BoardList boards={boards} /> */}
        <main>
          <BoardListTest boards={boards} />
        </main>
      </div>
    </div>
  )
}
