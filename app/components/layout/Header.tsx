'use client'
import { createBoard } from '@/app/lib/actions'
import React, { useEffect, useState } from 'react'

const Header: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev
      localStorage.setItem('darkMode', String(newMode))
      document.documentElement.classList.toggle('dark', newMode)
      return newMode
    })
  }
  return (
    <header className="mb-6 flex flex-col items-start justify-between gap-4 md:mb-8 md:flex-row md:items-center">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-indigo-400">
          dashboard_customize
        </span>
        <h1 className="text-xl font-bold text-black dark:text-white md:text-2xl">
          Kanban Board
        </h1>
      </div>
      <div className="flex w-full items-center gap-4 md:w-auto">
        <button
          onClick={toggleDarkMode}
          className="flex items-center rounded-lg bg-neutral-200 p-2 text-white transition-colors duration-200 hover:bg-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-200">
          <span className="material-symbols-outlined text-black dark:text-white">
            {isDarkMode ? 'dark_mode' : 'light_mode'}
          </span>
        </button>
        <button
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-indigo-700 dark:bg-indigo-900 dark:hover:bg-indigo-500 md:flex-none"
          onClick={() => createBoard()}>
          <span className="material-symbols-outlined animate-pulse">
            add_circle
          </span>
          새 페이지
        </button>
      </div>
    </header>
  )
}

export default Header
