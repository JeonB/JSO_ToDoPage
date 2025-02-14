const MyKanbanBoard = () => {
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

        <div className="flex flex-col gap-4 pb-4 md:flex-row md:gap-6 md:overflow-x-auto">
          <div className="w-full flex-shrink-0 rounded-xl border border-neutral-700 bg-neutral-800 p-4 shadow-sm md:w-[300px] lg:w-[350px]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">
                  format_list_bulleted
                </span>
                <h2 className="font-semibold text-white">To Do</h2>
              </div>
              <details className="relative">
                <summary className="cursor-pointer list-none rounded-lg p-2 transition-colors hover:bg-neutral-700">
                  <span className="material-symbols-outlined text-neutral-400">
                    more_vert
                  </span>
                </summary>
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-neutral-700 bg-neutral-800 py-2 shadow-lg">
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-white transition-colors hover:bg-neutral-700">
                    <span className="material-symbols-outlined text-indigo-400">
                      edit
                    </span>
                    Edit Board
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-400 transition-colors hover:bg-neutral-700">
                    <span className="material-symbols-outlined">delete</span>
                    Delete Board
                  </button>
                </div>
              </details>
            </div>

            <div className="space-y-3">
              <div className="group cursor-move rounded-lg border border-neutral-600 bg-neutral-700 p-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-green-400">
                      security
                    </span>
                    <p className="max-w-[200px] text-sm text-white md:max-w-[220px]">
                      Implement authentication system
                    </p>
                  </div>
                  <details className="relative opacity-0 transition-opacity group-hover:opacity-100">
                    <summary className="cursor-pointer list-none rounded-lg p-1 transition-colors hover:bg-neutral-600">
                      <span className="material-symbols-outlined text-sm text-neutral-400">
                        more_horiz
                      </span>
                    </summary>
                    <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-neutral-700 bg-neutral-800 py-2 shadow-lg">
                      <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-white transition-colors hover:bg-neutral-700">
                        <span className="material-symbols-outlined text-sm text-indigo-400">
                          edit
                        </span>
                        Edit
                      </button>
                      <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-400 transition-colors hover:bg-neutral-700">
                        <span className="material-symbols-outlined text-sm">
                          delete
                        </span>
                        Delete
                      </button>
                    </div>
                  </details>
                </div>
              </div>

              <button className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-700 px-3 py-2 text-neutral-400 transition-all duration-200 hover:scale-[1.02] hover:border-indigo-500 hover:text-indigo-400">
                <span className="material-symbols-outlined animate-pulse">
                  add_circle
                </span>
                Add Task
              </button>
            </div>
          </div>

          <button className="flex h-[200px] w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-700 text-neutral-400 transition-all duration-200 hover:scale-[1.02] hover:border-indigo-500 hover:text-indigo-400 md:w-[300px] lg:w-[350px]">
            <span className="material-symbols-outlined animate-pulse">
              add_circle
            </span>
            Add Board
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyKanbanBoard
