import { create } from 'zustand'
import { BoardType } from '../lib/type'

interface BoardStore {
  boardList: BoardType[]
  setBoardList: (boards: BoardType[]) => void
}

export const useBoardStore = create<BoardStore>()((set, get) => ({
  boardList: [],

  setBoardList: boards => {
    set({ boardList: boards })
  },
}))
