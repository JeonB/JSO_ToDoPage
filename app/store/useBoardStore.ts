import { create } from 'zustand'
import { BoardType } from '../lib/type'

// 상태 변경 감지 함수 (깊은 비교)
const areBoardsEqual = (prevBoards: BoardType[], newBoards: BoardType[]) => {
  if (prevBoards.length !== newBoards.length) return false
  return !prevBoards.some((prevBoard, i) => {
    const newBoard = newBoards[i]
    return (
      prevBoard.id !== newBoard.id ||
      prevBoard.title !== newBoard.title ||
      prevBoard.order !== newBoard.order ||
      prevBoard.tasks?.length !== newBoard.tasks?.length ||
      prevBoard.tasks?.some(
        (task, j) =>
          task.id !== newBoard.tasks?.[j].id ||
          task.title !== newBoard.tasks?.[j].title,
      )
    )
  })
}

interface BoardStore {
  boardList: BoardType[]
  setBoardList: (boards: BoardType[]) => void
  updateBoard: (boardId: string, newBoard: Partial<BoardType>) => void
}

export const useBoardStore = create<BoardStore>()((set, get) => ({
  boardList: [],

  setBoardList: boards => {
    const prevBoards = get().boardList
    if (!prevBoards.length) {
      // 초기 상태 설정 (최초 1회만 실행)
      set({ boardList: boards })
    } else if (!areBoardsEqual(prevBoards, boards)) {
      // 기존 상태와 다를 때만 업데이트
      set({ boardList: boards })
    }
  },

  updateBoard: (boardId, updateBoard) =>
    set(state => ({
      boardList: state.boardList.map(board =>
        board.id === boardId ? { ...board, ...updateBoard } : board,
      ),
    })),
}))
