'use client'
import { BoardType } from '@/app/lib/type'
import {
  createBoard,
  updateBoardOrder,
  updateTaskBoard,
  updateTaskOrder,
} from '@/app/lib/actions'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useEffect } from 'react'
import Board from './Board'
import Task from './Task'
import { useTaskStore } from '@/app/lib/store'
import AddBoardButton from '../ui/AddBoardButton'
import AddTaskButton from '../ui/AddTaskButton'

export default function BoardList({ boards }: { boards: BoardType[] }) {
  const { boards: boardList, setBoards, onTaskMove } = useTaskStore()

  useEffect(() => {
    setBoards(boards)
  }, [boards, setBoards])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)

    // Board 이동 처리
    const activeBoardIndex = boardList.findIndex(board => board.id === activeId)
    const overBoardIndex = boardList.findIndex(board => board.id === overId)

    if (activeBoardIndex !== -1 && overBoardIndex !== -1) {
      const updatedBoards = arrayMove(
        boardList,
        activeBoardIndex,
        overBoardIndex,
      )
      setBoards(updatedBoards)

      // 서버에 보드 순서 반영
      await Promise.all(
        updatedBoards.map((board, index) => updateBoardOrder(board.id, index)),
      )

      return
    }

    // Task 이동 처리
    const fromBoard = boardList.find(
      board => board.tasks?.some(task => task.id === activeId),
      console.log('activeId:', activeId),
    )
    if (!fromBoard) return

    const toBoard =
      boardList.find(board => board.tasks?.some(task => task.id === overId)) ||
      boardList.find(board => board.id === overId)

    if (!toBoard) return

    // 같은 보드 내 이동
    if (fromBoard.id === toBoard.id) {
      if (!fromBoard.tasks) return
      const taskIndex = fromBoard.tasks.findIndex(task => task.id === activeId)
      const newTaskIndex = fromBoard.tasks.findIndex(task => task.id === overId)

      if (taskIndex !== -1 && newTaskIndex !== -1) {
        const newTasks = arrayMove(fromBoard.tasks, taskIndex, newTaskIndex)
        const updatedBoards = boardList.map(board =>
          board.id === fromBoard.id ? { ...board, tasks: newTasks } : board,
        )
        setBoards(updatedBoards)

        // 서버에 태스크 순서 반영
        await Promise.all(
          newTasks.map((task, index) => updateTaskOrder(task.id, index)),
        )
      }
    }
    // 다른 보드로 이동
    else {
      const taskToMove = fromBoard.tasks?.find(task => task.id === activeId)
      if (!taskToMove) return

      const updatedFromBoard = {
        ...fromBoard,
        tasks: fromBoard.tasks?.filter(task => task.id !== activeId) || [],
      }

      const updatedToBoard = {
        ...toBoard,
        tasks: [...(toBoard.tasks || []), taskToMove],
      }

      const updatedBoards = boardList.map(board =>
        board.id === updatedFromBoard.id
          ? updatedFromBoard
          : board.id === updatedToBoard.id
            ? updatedToBoard
            : board,
      )

      setBoards(updatedBoards)

      // 서버에 보드 변경 및 태스크 순서 반영
      await updateTaskBoard(activeId, String(fromBoard.id), String(toBoard.id))
      await Promise.all(
        updatedToBoard.tasks.map((task, index) =>
          updateTaskOrder(task.id, index),
        ),
      )
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}>
      <SortableContext
        items={boardList.map(board => board.id)}
        strategy={horizontalListSortingStrategy}>
        <div className="flex flex-col gap-4 pb-4 md:flex-row md:gap-6 md:overflow-x-auto">
          {boardList.map(board => (
            <Board
              key={board.id}
              id={board.id}
              title={board.title}
              order={board.order}>
              <SortableContext
                items={board.tasks?.map(task => task.id) || []}
                strategy={verticalListSortingStrategy}>
                <div className="group space-y-3 rounded-lg bg-transparent p-3">
                  {board.tasks?.map(task => <Task key={task.id} task={task} />)}
                </div>
                <AddTaskButton id={board.id} />
              </SortableContext>
            </Board>
          ))}

          <AddBoardButton />
        </div>
      </SortableContext>
    </DndContext>
  )
}
