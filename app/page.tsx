import Header from '@/app/components/layout/Header'
import { getBoards } from '@/app/lib/data'
import BoardList from '@/app/components/kanbanboard/BoardList'

export default async function MyKanbanBoard() {
  const boards = await getBoards()
  return (
    <div className="select-none">
      <div className="min-h-[600px] w-full rounded-xl bg-gray-300 p-4 shadow-lg transition-colors duration-300 dark:bg-neutral-900 md:p-6">
        <Header />
        <main>
          <BoardList boards={boards} />
        </main>
      </div>
    </div>
  )
}
