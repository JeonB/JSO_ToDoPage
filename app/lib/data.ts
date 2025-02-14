'use server'

import mongoose from 'mongoose'
import { z } from 'zod'
import { connectDB } from './mongodb'
import { Task, Board } from './models'
import { TaskType, BoardType } from './type'
// Zod 스키마 정의 (입력 검증)
const TaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
})

// ✅ [CREATE] 새 데이터 추가
export async function createTask(data: TaskType) {
  const parsedData = TaskSchema.safeParse(data)
  if (!parsedData.success) return { error: parsedData.error.errors }

  await connectDB()
  const newTask = new Task(parsedData.data)
  await newTask.save()
  return { success: true, data: newTask }
}

// ✅ [READ] 모든 데이터 가져오기
export async function getTasks() {
  await connectDB()
  return await Task.find()
}

// ✅ [UPDATE] 특정 데이터 수정
export async function updateTask(id: string, data: TaskType) {
  const parsedData = TaskSchema.safeParse(data)
  if (!parsedData.success) return { error: parsedData.error.errors }

  await connectDB()
  const updatedTask = await Task.findByIdAndUpdate(id, parsedData.data, {
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
