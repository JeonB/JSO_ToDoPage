import { getTasks } from '@/app/lib/data'

export default async function TaskList() {
  const tasks = await getTasks()
  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  )
}
