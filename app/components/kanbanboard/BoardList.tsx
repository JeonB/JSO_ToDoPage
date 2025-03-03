'use client'
import { useEffect, useMemo, useState } from 'react'
import { BoardType } from '@/app/lib/type'
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  rectIntersection,
} from '@dnd-kit/core'
import {
  verticalListSortingStrategy,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import Board from './Board'
import Task from './Task'
import AddBoardButton from '../ui/AddBoardButton'
import AddTaskButton from '../ui/AddTaskButton'
import MemoContainer from './MemoContainer'
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
  const detectDeviceType = () => {
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase()

      // 모바일 User-Agent 체크
      const isMobileUA =
        /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent,
        )

      return isMobileUA ? 'mobile' : 'desktop'
    }

    return 'desktop'
  }
  const deviceType = detectDeviceType()
  const sensors = useSensors(
    useSensor(deviceType === 'mobile' ? TouchSensor : PointerSensor),
  )
  const memoizedSensors = useMemo(() => sensors, [sensors])

  return (
    <DndContext
      sensors={memoizedSensors}
      onDragOver={handleDragOver}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}>
      <SortableContext
        strategy={rectSortingStrategy}
        items={boardList.map(board => board.id)}>
        <div className="flex flex-col gap-4 pb-4 md:flex-row md:gap-6 md:overflow-x-auto">
          {boardList.map(board => (
            <MemoContainer key={board.id} id={board.id}>
              <Board board={board} autoFocus={board.id === newBoardId}>
                <SortableContext
                  items={board.tasks?.map(task => task.id) || []}
                  strategy={verticalListSortingStrategy}>
                  <div className="group space-y-3 rounded-lg bg-transparent p-3">
                    {board.tasks &&
                      board.tasks.map(task => (
                        <MemoContainer key={task.id} id={task.id}>
                          <Task task={task} autoFocus={task.id === newTaskId} />
                        </MemoContainer>
                      ))}
                  </div>
                  <AddTaskButton
                    id={board.id}
                    setNewTaskId={(taskId: string) => setNewTaskId(taskId)}
                  />
                </SortableContext>
              </Board>
            </MemoContainer>
          ))}
          <AddBoardButton
            setNewBoardId={(boardId: string) => setNewBoardId(boardId)}
          />
        </div>
      </SortableContext>

      <DragOverlay>
        {draggingTask && (
          <MemoContainer id={draggingTask.id}>
            <Task task={draggingTask} />
          </MemoContainer>
        )}
        {draggingBoard && (
          <MemoContainer id={draggingBoard.id}>
            <Board board={draggingBoard}>
              <SortableContext
                items={draggingBoard.tasks?.map(task => task.id) || []}
                strategy={verticalListSortingStrategy}>
                <div className="group space-y-3 rounded-lg bg-transparent p-3">
                  {draggingBoard.tasks?.map(task => (
                    <MemoContainer key={task.id} id={task.id}>
                      <Task task={task} />
                    </MemoContainer>
                  ))}
                </div>
                <AddTaskButton
                  id={draggingBoard.id}
                  setNewTaskId={(taskId: string) => setNewTaskId(taskId)}
                />
              </SortableContext>
            </Board>
          </MemoContainer>
        )}
      </DragOverlay>
    </DndContext>
  )
}
