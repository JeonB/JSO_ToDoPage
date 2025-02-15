import { TaskType } from '@/app/lib/type'
import Task from './Task'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useEffect } from 'react'
import { useState } from 'react'
import { updateTaskOrder } from '@/app/lib/actions'

export default function TaskList({ tasks }: { tasks: TaskType[] }) {
  const [taskList, setTaskList] = useState<TaskType[]>(tasks)

  useEffect(() => {
    setTaskList(tasks)
  }, [tasks])
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = taskList.findIndex(task => task.id === active.id)
    const newIndex = taskList.findIndex(task => task.id === over.id)
    const newItems = arrayMove(taskList, oldIndex, newIndex)

    setTaskList(newItems)

    await Promise.all(
      newItems.map((task, index) => updateTaskOrder(task.id, index)),
    )
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}>
      <SortableContext
        items={taskList.map(task => task.id)}
        strategy={verticalListSortingStrategy}>
        <div className="group space-y-3 rounded-lg bg-transparent p-3">
          {taskList.map(task => (
            <Task key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
