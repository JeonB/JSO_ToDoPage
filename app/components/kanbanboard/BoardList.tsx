'use client'
import { useEffect, useMemo, useState } from 'react'
import { BoardType } from '@/app/lib/type'
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
import Task from './Task'
import AddBoardButton from '../ui/AddBoardButton'
import AddTaskButton from '../ui/AddTaskButton'
import TaskContainer from './TaskContainer'
import { useBoardStore } from '@/app/store/useBoardStore'
import useDragAndDrop from '@/app/hooks/useDragAndDrop'
import useCustomSensors from '@/app/hooks/useCustomSensors'

export default function BoardList({ boards }: { boards: BoardType[] }) {
  const [newTaskId, setNewTaskId] = useState<string | null>(null)
  const [newBoardId, setNewBoardId] = useState<string | null>(null)

  const { boardList, setBoardList } = useBoardStore()

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
                items={
                  board.tasks && board.tasks.length > 0
                    ? board.tasks.map(task => task.id)
                    : [`empty-${board.id}`]
                }
                strategy={verticalListSortingStrategy}>
                <div className="group space-y-3 rounded-lg bg-transparent p-3">
                  {board.tasks &&
                    board.tasks.map(task => (
                      <TaskContainer key={task.id} id={task.id}>
                        <Task task={task} autoFocus={task.id === newTaskId} />
                      </TaskContainer>
                    ))}
                </div>
                <AddTaskButton
                  id={board.id}
                  setNewTaskId={(taskId: string) => setNewTaskId(taskId)}
                />
              </SortableContext>
            </Board>
          ))}
          <AddBoardButton
            setNewBoardId={(boardId: string) => setNewBoardId(boardId)}
          />
        </div>
      </SortableContext>

      <DragOverlay>
        {draggingTask && (
          <TaskContainer id={draggingTask.id}>
            <Task task={draggingTask} />
          </TaskContainer>
        )}
        {draggingBoard && (
          <Board
            id={draggingBoard.id}
            title={draggingBoard.title}
            order={draggingBoard.order}>
            {draggingBoard.tasks && (
              <SortableContext
                items={draggingBoard.tasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}>
                <div className="group space-y-3 rounded-lg bg-transparent p-3">
                  {draggingBoard.tasks?.map(task => (
                    <TaskContainer key={task.id} id={task.id}>
                      <Task task={task} />
                    </TaskContainer>
                  ))}
                </div>
                <AddTaskButton
                  id={draggingBoard.id}
                  setNewTaskId={(taskId: string) => setNewTaskId(taskId)}
                />
              </SortableContext>
            )}
          </Board>
        )}
      </DragOverlay>
    </DndContext>
  )
}
