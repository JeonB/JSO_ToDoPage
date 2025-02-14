import { TaskType } from '@/app/lib/type'
import Task from './Task'

export default function TaskList({ tasks }: { tasks: TaskType[] }) {
  return (
    <div className="group cursor-move rounded-lg border border-neutral-600 bg-neutral-700 p-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
      {tasks.map(task => (
        <Task key={task.id} task={task} />
      ))}
    </div>
  )
}
