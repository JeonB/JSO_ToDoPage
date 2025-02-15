'use server'

import { z } from 'zod'
import { connectDB } from './mongodb'
import { Task, Board } from './models'
import { TaskType, BoardType } from './type'
import { revalidatePath } from 'next/cache'

const TaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
})

const BoardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export async function createTask(boardId: string) {
  const data = { title: '' }

  try {
    await connectDB()
    const newTask = new Task(data)
    await newTask.save()

    await Board.findByIdAndUpdate(boardId, {
      $push: { tasks: newTask._id },
    })
  } catch (error) {
    console.log('데이터베이스 에러: ', error)
    throw new Error('할일 생성 실패')
  }

  revalidatePath('/')
}

export async function updateTaskTitle(data: TaskType) {
  const parsedData = TaskSchema.safeParse(data)
  if (!parsedData.success) return { error: parsedData.error.errors }
  try {
    await connectDB()
    const updatedTask = await Task.findByIdAndUpdate(
      data.id,
      { title: data.title },
      {
        new: true,
      },
    )
    if (!updatedTask) {
      return { error: 'Task not found' }
    }
  } catch (error) {
    console.log('데이터베이스 에러: ', error)
    throw new Error('할일 수정 실패')
  }
}

export async function deleteTask(id: string) {
  try {
    await connectDB()
    const deletedTask = await Task.findByIdAndDelete(id)
    if (!deletedTask) {
      return { error: 'Task not found' }
    }
  } catch (error) {
    console.log('데이터베이스 에러: ', error)
    throw new Error('할일 삭제 실패')
  }
  revalidatePath('/')
}

export async function createBoard() {
  const data = { name: '' }
  try {
    await connectDB()
    const newBoard = new Board(data)
    await newBoard.save()
  } catch (error) {
    console.log('데이터베이스 에러: ', error)
    throw new Error('보드 생성 실패')
  }
  revalidatePath('/')
}

export async function updateBoardName(data: BoardType) {
  const parsedData = BoardSchema.safeParse(data)
  if (!parsedData.success) return { error: parsedData.error.errors }

  try {
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
  } catch (error) {
    console.log('데이터베이스 에러: ', error)
    throw new Error('보드 수정 실패')
  }
}

export async function deleteBoard(id: string) {
  try {
    await connectDB()

    const board = await Board.findById(id).populate('tasks')
    if (!board) {
      return { error: 'Board not found' }
    }

    const taskIds = board.tasks?.map((task: TaskType) => task.id)
    await Task.deleteMany({ id: { $in: taskIds } })

    const deletedBoard = await Board.findByIdAndDelete(id)
    if (!deletedBoard) {
      return { error: 'Board not found' }
    }
  } catch (error) {
    console.log('데이터베이스 에러: ', error)
    throw new Error('보드 삭제 실패')
  }
  revalidatePath('/')
}
