'use client'
import { useState, TouchEvent, PointerEvent } from 'react'
import { BoardType, TaskType } from '@/app/lib/type'
import {
  updateBoardOrder,
  updateTaskBoard,
  updateTaskOrder,
} from '@/app/lib/actions'
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable'
import Board from './Board'
import TaskTest from './TaskTest'
import AddBoardButton from '../ui/AddBoardButton'
import AddTaskButton from '../ui/AddTaskButton'
import TaskContainer from './TaskContainer'
import useBoardList from '@/app/hooks/useBoardList'

export default function BoardListTest({ boards }: { boards: BoardType[] }) {
  const [draggingTask, setDraggingTask] = useState<TaskType | null>(null)
  const [newTaskId, setNewTaskId] = useState<string | null>(null)
  const [newBoardId, setNewBoardId] = useState<string | null>(null)
  const { boardList, setBoardList, boardListRef } = useBoardList(boards)
  const [draggingBoard, setDraggingBoard] = useState<BoardType | null>(null)

  const customHandleEvent = (element: HTMLElement | null) => {
    let cur = element

    while (cur) {
      if (cur.dataset.noDnd) {
        return false
      }
      cur = cur.parentElement
    }

    return true
  }

  PointerSensor.activators = [
    {
      eventName: 'onPointerDown',
      handler: ({ nativeEvent: event }: PointerEvent) =>
        customHandleEvent(event.target as HTMLElement),
    },
  ]

  TouchSensor.activators = [
    {
      eventName: 'onTouchStart',
      handler: ({ nativeEvent: event }: TouchEvent) =>
        customHandleEvent(event.target as HTMLElement),
    },
  ]

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeId = String(active.id)

    // DragOverlay에서 보여줄 Task 찾기
    const task = boardList
      .flatMap(board => board.tasks || [])
      .find(task => task.id === activeId)
    if (task) {
      setDraggingTask(task)
    }

    const board = boardList.find(board => board.id === activeId)
    if (board) {
      setDraggingBoard(board)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setDraggingTask(null)
    setDraggingBoard(null)

    if (!over || active.id === over.id) {
      return
    }

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

      await Promise.all(
        updatedBoards.map((board, index) => updateBoardOrder(board.id, index)),
      )

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
      if (overTask) {
        toBoard = boardList.find(board =>
          board.tasks?.some(task => task.id === overTask.id),
        )
      }
    }
    if (!toBoard) return

    if (fromBoard.id === toBoard.id) {
      const taskIndex = fromBoard.tasks?.findIndex(task => task.id === activeId)
      const newTaskIndex = fromBoard.tasks?.findIndex(
        task => task.id === overId,
      )

      if (
        taskIndex !== undefined &&
        newTaskIndex !== undefined &&
        taskIndex !== -1 &&
        newTaskIndex !== -1
      ) {
        const newTasks = arrayMove(
          fromBoard.tasks || [],
          taskIndex,
          newTaskIndex,
        )
        const updatedBoards = boardList.map(board =>
          board.id === fromBoard.id ? { ...board, tasks: newTasks } : board,
        )
        setBoardList(updatedBoards)

        await Promise.all(
          newTasks.map((task, index) => updateTaskOrder(task.id, index)),
        )
      }
      setDraggingTask(null)
      return
    }

    const taskToMove = fromBoard.tasks?.find(task => task.id === activeId)
    if (!taskToMove) {
      console.error(`이동할 Task 찾을 수 없음 | activeId: ${activeId}`)
      return
    }

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

    setBoardList(updatedBoards)

    try {
      await updateTaskBoard(activeId, String(fromBoard.id), String(toBoard.id))

      await Promise.all(
        updatedToBoard.tasks.map((task, index) =>
          updateTaskOrder(task.id, index),
        ),
      )
    } catch (error) {
      console.error('updateTaskBoard failed:', error)
      setBoardList(boardList)
    }

    setDraggingTask(null)
  }

  const handleDragOver = async (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const fromBoard = boardListRef.current.find(board =>
      board.tasks?.some(task => task.id === activeId),
    )
    if (!fromBoard) return

    let toBoard = boardListRef.current.find(board => board.id === overId)
    if (!toBoard) {
      const overTask = boardListRef.current
        .flatMap(board => board.tasks || [])
        .find(task => task.id === overId)

      toBoard = boardListRef.current.find(board =>
        board.tasks?.some(task => task.id === overTask?.id),
      )
    }

    if (!toBoard || fromBoard.id === toBoard.id) return

    const taskToMove = fromBoard.tasks?.find(task => task.id === activeId)
    if (!taskToMove) return

    const targetIndex =
      toBoard.tasks?.findIndex(task => task.id === overId) ??
      toBoard.tasks?.length

    const updatedBoards = boardListRef.current.map(board => {
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

    if (
      JSON.stringify(updatedBoards) !== JSON.stringify(boardListRef.current)
    ) {
      setBoardList(updatedBoards)
    }

    try {
      await updateTaskBoard(activeId, String(fromBoard.id), String(toBoard.id))

      const updatedToBoard = updatedBoards.find(
        board => board.id === toBoard.id,
      )
      if (updatedToBoard) {
        if (updatedToBoard.tasks) {
          await Promise.all(
            updatedToBoard.tasks.map((task, index) =>
              updateTaskOrder(task.id, index),
            ),
          )
        }
      }
    } catch (error) {
      console.error('updateTaskBoard failed:', error)
      setBoardList(boardListRef.current)
    }
  }

  const handleTaskChange = (taskId: string, newTitle: string) => {
    setBoardList(prevBoards =>
      prevBoards.map(board => {
        const updatedTasks = board.tasks?.map(task =>
          task.id === taskId && task.title !== newTitle
            ? { ...task, title: newTitle }
            : task,
        )

        return updatedTasks === board.tasks
          ? board
          : { ...board, tasks: updatedTasks }
      }),
    )
  }

  const handleTaskCreated = (boardId: string, newTask: TaskType) => {
    setBoardList(prevBoards =>
      prevBoards.map(board =>
        board.id === boardId
          ? { ...board, tasks: [...(board.tasks || []), newTask] }
          : board,
      ),
    )
    setNewTaskId(newTask.id)
  }

  const handleBoardCreated = (boardId: string) => {
    setNewBoardId(boardId)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragOver={handleDragOver}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}>
      <SortableContext
        strategy={horizontalListSortingStrategy}
        items={boardList.map(board => board.id)}>
        <div className="flex flex-col gap-4 pb-4 md:flex-row md:gap-6 md:overflow-x-auto">
          {boardList.map(board => (
            <Board
              key={board.id}
              id={board.id}
              title={board.title}
              order={board.order}
              autoFocus={board.id === newBoardId}>
              <SortableContext
                items={
                  board.tasks
                    ? board.tasks.map(task => task.id)
                    : [`empty-${board.id}`]
                }
                strategy={verticalListSortingStrategy}>
                <div className="group space-y-3 rounded-lg bg-transparent p-3">
                  {board.tasks &&
                    board.tasks.map(task => (
                      <TaskContainer key={task.id} id={task.id}>
                        <TaskTest
                          task={task}
                          autoFocus={task.id === newTaskId}
                          onChange={handleTaskChange}
                        />
                      </TaskContainer>
                    ))}
                </div>
                <AddTaskButton
                  id={board.id}
                  onTaskCreated={handleTaskCreated}
                />
              </SortableContext>
            </Board>
          ))}
          <AddBoardButton onBoardCreated={handleBoardCreated} />
        </div>
      </SortableContext>

      <DragOverlay>
        {draggingTask && (
          <TaskContainer id={draggingTask.id}>
            <TaskTest task={draggingTask} onChange={handleTaskChange} />
          </TaskContainer>
        )}
        {draggingBoard && (
          <Board
            id={draggingBoard.id}
            title={draggingBoard.title}
            order={draggingBoard.order}>
            <SortableContext
              items={(draggingBoard.tasks || []).map(task => task.id)}
              strategy={verticalListSortingStrategy}>
              <div className="group space-y-3 rounded-lg bg-transparent p-3">
                {draggingBoard.tasks ? (
                  draggingBoard.tasks.map(task => (
                    <TaskContainer key={task.id} id={task.id}>
                      <TaskTest task={task} onChange={handleTaskChange} />
                    </TaskContainer>
                  ))
                ) : (
                  <div>no tasks</div>
                )}
              </div>
              <AddTaskButton
                id={draggingBoard.id}
                onTaskCreated={handleTaskCreated}
              />
            </SortableContext>
          </Board>
        )}
      </DragOverlay>
    </DndContext>
  )
}
