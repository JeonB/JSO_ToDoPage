'use client'
import { createBoard } from '@/app/lib/actions'
import React from 'react'

const Header: React.FC = () => {
  return (
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
        <button
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-indigo-700 md:flex-none"
          onClick={() => createBoard()}>
          <span className="material-symbols-outlined animate-pulse">
            add_circle
          </span>
          New Board
        </button>
      </div>
    </header>
  )
}

export default Header
