import { TaskType } from '@/app/lib/type'
import Task from './Task'

export default function TaskList({ tasks }: { tasks: TaskType[] }) {
  return (
    <div className="group space-y-3 rounded-lg bg-transparent p-3">
      {tasks.map(task => (
        <Task key={task.id} task={task} />
      ))}
    </div>
  )
}
