import { useState, useEffect, useRef } from 'react'
import { BoardType } from '@/app/lib/type'

export default function useBoardList(initialBoards: BoardType[]) {
  const [boardList, setBoardList] = useState<BoardType[]>([])
  const boardListRef = useRef<BoardType[]>([])

  useEffect(() => {
    setBoardList(initialBoards)
    boardListRef.current = initialBoards
  }, [initialBoards])

  useEffect(() => {
    boardListRef.current = boardList
  }, [boardList])

  return { boardList, setBoardList, boardListRef }
}
