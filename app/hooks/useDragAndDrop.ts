import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { useBoardStore } from '../store/useBoardStore'
import { arrayMove } from '@dnd-kit/sortable'
import { updateBoardAndTasks } from '../lib/actions'
import { useState } from 'react'
import { TaskType, BoardType } from '../lib/type'
import { useDebouncedCallback } from 'use-debounce'

export default function useDragAndDrop() {
  const { boardList, setBoardList } = useBoardStore()

  const [draggingTask, setDraggingTask] = useState<TaskType | null>(null)
  const [draggingBoard, setDraggingBoard] = useState<BoardType | null>(null)

  // Drag 시작 시 선택한 Task 또는 Board 저장
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeId = String(active.id)

    const task = boardList
      .flatMap(board => board.tasks || [])
      .find(task => task.id === activeId)
    if (task) setDraggingTask(task)

    const board = boardList.find(board => board.id === activeId)
    if (board) setDraggingBoard(board)
  }

  let dragOverFrame: number | null = null // DragOver 이벤트 발생 시간 간격을 조절하기 위한 변수

  const handleDragOver = (event: DragOverEvent) => {
    if (dragOverFrame) cancelAnimationFrame(dragOverFrame)

    dragOverFrame = requestAnimationFrame(async () => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeId = String(active.id)
      const overId = String(over.id)

      // Board 이동 처리
      const activeBoardIndex = boardList.findIndex(
        board => board.id === activeId,
      )
      const overBoardIndex = boardList.findIndex(board => board.id === overId)

      if (activeBoardIndex !== -1 && overBoardIndex !== -1) {
        // Board를 이동
        const updatedBoards = arrayMove(
          boardList,
          activeBoardIndex,
          overBoardIndex,
        )

        setBoardList(updatedBoards)
        const reorderedBoards = updatedBoards.map((board, index) => ({
          ...board,
          order: index,
        }))
        debouncedUpdateTaskBoard(reorderedBoards)
        return
      }

      // Task 이동 처리
      const fromBoard = boardList.find(board =>
        board.tasks?.some(task => task.id === activeId),
      )
      if (!fromBoard) return

      let toBoard = boardList.find(board => board.id === overId)
      if (!toBoard) {
        const overTask = boardList
          .flatMap(board => board.tasks || [])
          .find(task => task.id === overId)
        toBoard = boardList.find(board =>
          board.tasks?.some(task => task.id === overTask?.id),
        )
      }
      if (!toBoard) return

      const taskToMove = fromBoard.tasks?.find(task => task.id === activeId)
      if (!taskToMove) return

      const targetIndex =
        toBoard.tasks?.findIndex(task => task.id === overId) ??
        toBoard.tasks?.length

      let updatedBoards

      if (fromBoard.id === toBoard.id) {
        // 같은 Board 내에서 Task 이동 (arrayMove 적용)
        const updatedTasks = arrayMove(
          [...(fromBoard.tasks || [])],
          fromBoard.tasks?.findIndex(task => task.id === activeId) ?? -1,
          targetIndex ?? -1,
        )

        const updatedBoard = {
          ...fromBoard,
          tasks: updatedTasks,
        }

        updatedBoards = boardList.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board,
        )
      } else {
        // 다른 Board로 이동하는 경우
        const updatedFromBoard = {
          ...fromBoard,
          tasks: fromBoard.tasks?.filter(task => task.id !== activeId) || [],
        }

        const updatedToBoard = {
          ...toBoard,
          tasks: [
            ...(toBoard.tasks ? toBoard.tasks.slice(0, targetIndex) : []),
            { ...taskToMove },
            ...(toBoard.tasks ? toBoard.tasks.slice(targetIndex) : []),
          ],
        }

        updatedBoards = boardList.map(board =>
          board.id === updatedFromBoard.id
            ? updatedFromBoard
            : board.id === updatedToBoard.id
              ? updatedToBoard
              : board,
        )
      }

      setBoardList(updatedBoards)
      debouncedUpdateTaskBoard(updatedBoards)
    })
  }

  const debouncedUpdateTaskBoard = useDebouncedCallback(
    async (updatedBoards: BoardType[]) => {
      try {
        await updateBoardAndTasks(updatedBoards)
      } catch (error) {
        console.error('updateTaskBoard failed during dragOver:', error)
      }
    },
    200,
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setDraggingTask(null)
    setDraggingBoard(null)

    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const activeBoardIndex = boardList.findIndex(board => board.id === activeId)
    const overBoardIndex = boardList.findIndex(board => board.id === overId)

    if (activeBoardIndex !== -1 && overBoardIndex !== -1) {
      const updatedBoards = arrayMove(
        boardList,
        activeBoardIndex,
        overBoardIndex,
      )

      setBoardList(updatedBoards)

      return
    }

    const fromBoard = boardList.find(board =>
      board.tasks?.some(task => task.id === activeId),
    )
    if (!fromBoard) return

    let toBoard = boardList.find(board => board.id === overId)

    if (!toBoard) {
      const overTask = boardList
        .flatMap(board => board.tasks || [])
        .find(task => task.id === overId)
      toBoard = boardList.find(board =>
        board.tasks?.some(task => task.id === overTask?.id),
      )
    }
    if (!toBoard) return

    const taskToMove = fromBoard.tasks?.find(task => task.id === activeId)
    if (!taskToMove) {
      console.error(`이동할 Task 찾을 수 없음 | activeId: ${activeId}`)
      return
    }

    const targetIndex =
      toBoard.tasks?.findIndex(task => task.id === overId) ??
      toBoard.tasks?.length

    let updatedBoards

    if (fromBoard.id === toBoard.id) {
      // 같은 보드 내에서 Task 순서 변경
      const updatedTasks = arrayMove(
        [...(fromBoard.tasks || [])],
        fromBoard.tasks?.findIndex(task => task.id === activeId) ?? -1,
        targetIndex ?? -1,
      )

      const updatedBoard = {
        ...fromBoard,
        tasks: updatedTasks,
      }

      updatedBoards = boardList.map(board =>
        board.id === updatedBoard.id ? updatedBoard : board,
      )
    } else {
      // 다른 보드로 이동하는 경우
      const updatedFromBoard = {
        ...fromBoard,
        tasks: fromBoard.tasks?.filter(task => task.id !== activeId) || [],
      }

      const updatedToBoard = {
        ...toBoard,
        tasks: [
          ...(toBoard.tasks ? toBoard.tasks.slice(0, targetIndex) : []),
          { ...taskToMove },
          ...(toBoard.tasks ? toBoard.tasks.slice(targetIndex) : []),
        ],
      }

      updatedBoards = boardList.map(board =>
        board.id === updatedFromBoard.id
          ? updatedFromBoard
          : board.id === updatedToBoard.id
            ? updatedToBoard
            : board,
      )
    }

    setBoardList(updatedBoards)
  }

  return {
    draggingBoard,
    draggingTask,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  }
}
