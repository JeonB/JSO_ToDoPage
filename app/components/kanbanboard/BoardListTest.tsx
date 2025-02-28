'use client'
import { useEffect, useMemo, useState } from 'react'
import { BoardType, TaskType } from '@/app/lib/type'
import {
  closestCorners,
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
} from '@dnd-kit/core'
import {
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable'
import Board from './Board'
import TaskTest from './TaskTest'
import AddBoardButton from '../ui/AddBoardButton'
import AddTaskButton from '../ui/AddTaskButton'
import TaskContainer from './TaskContainer'
import { useBoardStore } from '@/app/store/useBoardStore'
import useDragAndDrop from '@/app/hooks/useDragAndDrop'
import useCustomSensors from '@/app/hooks/useCustomSensors'

export default function BoardListTest({ boards }: { boards: BoardType[] }) {
  const [newTaskId, setNewTaskId] = useState<string | null>(null)
  const [newBoardId, setNewBoardId] = useState<string | null>(null)

  const { boardList, setBoardList, updateBoard } = useBoardStore()

  // Zustand 초기화: 최초 렌더링 시 boards를 설정
  useEffect(() => {
    setBoardList(boards)
  }, [boards, setBoardList])

  const {
    draggingBoard,
    draggingTask,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  } = useDragAndDrop()

  const { PointerSensor, TouchSensor } = useCustomSensors()
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))
  const memoizedSensors = useMemo(() => sensors, [sensors])

  const handleTaskChange = (taskId: string, newTitle: string) => {
    const board = boardList.find(board =>
      board.tasks?.some(task => task.id === taskId),
    )
    if (!board) return

    const updatedTasks = board.tasks!.map(task =>
      task.id === taskId && task.title !== newTitle
        ? { ...task, title: newTitle }
        : task,
    )
    updateBoard(board.id, { tasks: updatedTasks })
  }

  const handleTaskCreated = (boardId: string, newTask: TaskType) => {
    const board = boardList.find(board => board.id === boardId)
    if (!board) return

    updateBoard(boardId, {
      tasks: [...(board.tasks || []), newTask],
    })

    setNewTaskId(newTask.id)
  }

  const handleBoardCreated = (boardId: string) => {
    setNewBoardId(boardId)
  }

  return (
    <DndContext
      sensors={memoizedSensors}
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
                items={board.tasks?.map(task => task.id) || []}
                strategy={verticalListSortingStrategy}>
                <div className="group space-y-3 rounded-lg bg-transparent p-3">
                  {board.tasks?.map(task => (
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
              items={draggingBoard.tasks?.map(task => task.id) || []}
              strategy={verticalListSortingStrategy}>
              <div className="group space-y-3 rounded-lg bg-transparent p-3">
                {draggingBoard.tasks?.map(task => (
                  <TaskContainer key={task.id} id={task.id}>
                    <TaskTest task={task} onChange={handleTaskChange} />
                  </TaskContainer>
                ))}
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
