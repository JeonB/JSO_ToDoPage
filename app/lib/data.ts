import connectDB from './mongodb'
import { Task, Board } from './models'
import { TaskType, BoardType } from './type'

export async function getTasks() {
  try {
    await connectDB()
    const tasks = await Task.find().lean()
    const convertedTasks: TaskType[] = tasks.map(task => ({
      id: task._id.toString(),
      title: task.title,
      order: task.order,
    }))
    return convertedTasks
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw new Error('Failed to fetch tasks')
  }
}

export async function getBoards() {
  try {
    await connectDB()
    const boards = await Board.find().populate('tasks').lean()
    const convertedBoards: BoardType[] = boards.map(board => ({
      id: board._id.toString(),
      title: board.title,
      order: board.order,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tasks: board.tasks?.map((task: any) => ({
        id: task._id.toString(),
        title: task.title,
        order: task.order,
      })),
    }))
    return convertedBoards
  } catch (error) {
    console.error('Error fetching boards:', error)
    throw new Error('Failed to fetch boards')
  }
}
