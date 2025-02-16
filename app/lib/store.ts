import { create } from 'zustand'
import { BoardType } from './type'

interface TaskStore {
  boards: BoardType[]
  setBoards: (boards: BoardType[]) => void
  onTaskMove: (taskId: string, fromBoardId: string, toBoardId: string) => void
}

export const useTaskStore = create<TaskStore>(set => ({
  boards: [],
  setBoards: boards => set({ boards }),
  onTaskMove: (taskId, fromBoardId, toBoardId) => {
    set(state => {
      const fromBoard = state.boards.find(board => board.id === fromBoardId)
      const toBoard = state.boards.find(board => board.id === toBoardId)

      if (!fromBoard || !toBoard) return state

      const task = fromBoard.tasks?.find(task => task.id === taskId)
      if (!task) return state

      // 새로운 tasks 배열 생성 (불변성 유지)
      const updatedFromBoard = {
        ...fromBoard,
        tasks: (fromBoard.tasks || []).filter(task => task.id !== taskId),
      }

      const updatedToBoard = {
        ...toBoard,
        tasks: [...(toBoard.tasks || []), task],
      }

      // boards 배열을 새롭게 생성하여 업데이트
      const updatedBoards = state.boards.map(board =>
        board.id === updatedFromBoard.id
          ? updatedFromBoard
          : board.id === updatedToBoard.id
            ? updatedToBoard
            : board,
      )

      return { boards: updatedBoards }
    })
  },
}))
