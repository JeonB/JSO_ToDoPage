import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useBoardStore } from '../store/useBoardStore'
import useCustomSensors from './useCustomSensors'
import { arrayMove } from '@dnd-kit/sortable'
import {
  updateBoardOrder,
  updateTaskOrder,
  updateTaskBoard,
} from '../lib/actions'
import { useState, useMemo } from 'react'
import { TaskType, BoardType } from '../lib/type'
import { useDebouncedCallback } from 'use-debounce'

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
  let dragOverFrame: number | null = null // 상태 업데이트 타이머

  const handleDragOver = (event: DragOverEvent) => {
    if (dragOverFrame) cancelAnimationFrame(dragOverFrame)

    dragOverFrame = requestAnimationFrame(async () => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeId = String(active.id)
      const overId = String(over.id)

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
      if (!toBoard || fromBoard.id === toBoard.id) return

      const taskToMove = fromBoard.tasks?.find(task => task.id === activeId)
      if (!taskToMove) return

      const targetIndex =
        toBoard.tasks?.findIndex(task => task.id === overId) ??
        toBoard.tasks?.length

      const updatedBoards = boardList.map(board => {
        if (board.id === fromBoard.id) {
          return {
            ...board,
            tasks: board.tasks?.filter(task => task.id !== activeId),
          }
        }
        if (board.id === toBoard.id) {
          const updatedTasks = [
            ...(toBoard.tasks ? toBoard.tasks.slice(0, targetIndex) : []),
            { ...taskToMove },
            ...(toBoard.tasks ? toBoard.tasks.slice(targetIndex) : []),
          ]
          return {
            ...board,
            tasks: updatedTasks,
          }
        }
        return board
      })

      if (!areBoardsEqual(boardList, updatedBoards)) {
        setBoardList(updatedBoards)

        // 백엔드 API 호출 추가: Task 이동 즉시 반영
        debouncedUpdateTaskBoard(
          activeId,
          String(fromBoard.id),
          String(toBoard.id),
          updatedBoards,
        )
      }
    })
  }

  const debouncedUpdateTaskBoard = useDebouncedCallback(
    async (activeId, fromBoardId, toBoardId, updatedBoards: BoardType[]) => {
      try {
        await updateTaskBoard(activeId, fromBoardId, toBoardId)
        // Task 순서 업데이트 (비동기 처리)
        await Promise.all(
          updatedBoards
            .find(board => board.id === toBoardId)
            ?.tasks?.map((task, index) => updateTaskOrder(task.id, index)) ||
            [],
        )
      } catch (error) {
        console.error('updateTaskBoard failed during dragOver:', error)
      }
    },
    300, // 300ms 지연
  )

  // Drag 종료 시 보드/태스크 이동 및 API 호출
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setDraggingTask(null)
    setDraggingBoard(null)

    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const rollbackState = [...boardList] // 원래 상태 저장

    // Board 이동
    const activeBoardIndex = boardList.findIndex(board => board.id === activeId)
    const overBoardIndex = boardList.findIndex(board => board.id === overId)

    if (activeBoardIndex !== -1 && overBoardIndex !== -1) {
      const updatedBoards = arrayMove(
        boardList,
        activeBoardIndex,
        overBoardIndex,
      )

      if (!areBoardsEqual(boardList, updatedBoards)) {
        setBoardList(updatedBoards)
        setTimeout(() => {
          Promise.all(
            updatedBoards.map((board, index) =>
              updateBoardOrder(board.id, index),
            ),
          )
        }, 300)
      }
      return
    }

    // Task 이동
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

    // 같은 보드 내에서 Task 위치 변경
    if (fromBoard.id === toBoard.id) {
      const taskIndex = fromBoard.tasks?.findIndex(task => task.id === activeId)
      const newTaskIndex = fromBoard.tasks?.findIndex(
        task => task.id === overId,
      )

      if (taskIndex !== undefined && newTaskIndex !== undefined) {
        const newTasks = arrayMove(
          fromBoard.tasks || [],
          taskIndex,
          newTaskIndex,
        )
        const updatedBoards = boardList.map(board =>
          board.id === fromBoard.id ? { ...board, tasks: newTasks } : board,
        )

        if (!areBoardsEqual(boardList, updatedBoards)) {
          setBoardList(updatedBoards)
          setTimeout(() => {
            Promise.all(
              newTasks.map((task, index) => updateTaskOrder(task.id, index)),
            )
          }, 300)
        }
      }
      return
    }

    // 다른 보드로 이동
    const updatedFromBoard = {
      ...fromBoard,
      tasks: fromBoard.tasks?.filter(task => task.id !== activeId) || [],
    }

    const targetIndex =
      toBoard.tasks?.findIndex(task => task.id === overId) ??
      toBoard.tasks?.length

    const updatedToBoard = {
      ...toBoard,
      tasks: [
        ...(toBoard.tasks ? toBoard.tasks.slice(0, targetIndex) : []),
        { ...taskToMove },
        ...(toBoard.tasks ? toBoard.tasks.slice(targetIndex) : []),
      ],
    }

    const updatedBoards = boardList.map(board =>
      board.id === updatedFromBoard.id
        ? updatedFromBoard
        : board.id === updatedToBoard.id
          ? updatedToBoard
          : board,
    )

    if (!areBoardsEqual(boardList, updatedBoards)) {
      setBoardList(updatedBoards)

      try {
        await updateTaskBoard(
          activeId,
          String(fromBoard.id),
          String(toBoard.id),
        )
        setTimeout(() => {
          Promise.all(
            updatedToBoard.tasks.map((task, index) =>
              updateTaskOrder(task.id, index),
            ),
          )
        }, 300)
      } catch (error) {
        console.error('updateTaskBoard failed:', error)
        setBoardList(rollbackState) // 원래 상태로 복구
      }
    }
  }

  return {
    draggingBoard,
    draggingTask,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  }
}
