'use server'

import { z } from 'zod'
import { connectDB } from './mongodb'
import { Task, Board } from './models'
import { TaskType, BoardType } from './type'
// Zod 스키마 정의 (입력 검증)
const TaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
})

const BoardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

// ✅ [CREATE] 새 데이터 추가
export async function createTask() {
  const data = { title: '' }

  await connectDB()
  const newTask = new Task(data)
  await newTask.save()
}

// ✅ [UPDATE] 특정 데이터 수정
export async function updateTaskTitle(data: TaskType) {
  const parsedData = TaskSchema.safeParse(data)
  if (!parsedData.success) return { error: parsedData.error.errors }

  await connectDB()
  const updatedTask = await Task.findByIdAndUpdate(data.id, parsedData.data, {
    new: true,
  })
  return updatedTask
    ? { success: true, data: updatedTask }
    : { error: 'Task not found' }
}

// ✅ [DELETE] 특정 데이터 삭제
export async function deleteTask(id: string) {
  await connectDB()
  const deletedTask = await Task.findByIdAndDelete(id)
  return deletedTask ? { success: true } : { error: 'Task not found' }
}

// ✅ [CREATE] 새 데이터 추가
export async function createBoard() {
  const data = { name: '' }
  await connectDB()
  const newBoard = new Board(data)
  await newBoard.save()
}

// ✅ [UPDATE] 특정 데이터 수정
export async function updateBoardName(data: BoardType) {
  const parsedData = BoardSchema.safeParse(data)
  if (!parsedData.success) return { error: parsedData.error.errors }

  await connectDB()
  const updatedBoard = await Board.findByIdAndUpdate(
    data.id,
    { name: data.name },
    {
      new: true,
    },
  )
    .populate('tasks')
    .lean()

  if (!updatedBoard) {
    return { error: 'Board not found' }
  }
}

// ✅ [DELETE] 특정 데이터 삭제
export async function deleteBoard(id: string) {
  await connectDB()

  // 보드에 포함된 모든 Task를 삭제
  const board = await Board.findById(id).populate('tasks')
  if (!board) {
    return { error: 'Board not found' }
  }

  const taskIds = board.tasks?.map((task: TaskType) => task.id)
  await Task.deleteMany({ id: { $in: taskIds } })

  // 보드 삭제
  const deletedBoard = await Board.findByIdAndDelete(id)
  return deletedBoard ? { success: true } : { error: 'Board not found' }
}
