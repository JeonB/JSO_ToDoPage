'use client'
import { TaskType } from '@/app/lib/type'
import DetailsMenu from './DetailsMenu'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { updateTaskTitle, deleteTask } from '@/app/lib/actions'

export default function Task({ task }: { task: TaskType }) {
  const [taskTitle, setTaskTitle] = useState<string>(task.title)

  const debouncedUpdate = useDebouncedCallback(
    async (taskId: string, newTitle: string) => {
      if (newTitle.trim() && newTitle !== task.title) {
        await updateTaskTitle({ id: taskId, title: newTitle })
      }
    },
    300,
  )

  const handleInputChange = (taskId: string, newTitle: string) => {
    setTaskTitle(newTitle)
    debouncedUpdate(taskId, newTitle)
  }

  return (
    <div className="flex items-start justify-between">
      <input
        type="text"
        value={taskTitle}
        onChange={e => handleInputChange(task.id, e.target.value)}
        className="w-full max-w-[220px] rounded-lg border border-neutral-600 bg-neutral-700 p-2 text-white"
        placeholder="Enter new task title"
      />

      <DetailsMenu
        editLabel="Edit"
        deleteLabel="Delete"
        onEdit={() => deleteTask(task.id)}
        onDelete={() => deleteTask(task.id)}
      />
    </div>
  )
}
