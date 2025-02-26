'use server'

import { z } from 'zod'
import connectDB from './mongodb'
import { Task, Board } from './models'
import { TaskType, BoardType } from './type'
import { revalidatePath } from 'next/cache'

const TaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  order: z.number().optional(),
  boardId: z.string().optional(),
})

const BoardSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  order: z.number().optional(),
  tasks: z.array(z.string()).optional(),
})

export async function createTask(boardId: string) {
  const parsedBoardId = z.string().parse(boardId)

  try {
    const data = { title: '' }
    await connectDB()
    const newTask = new Task(data)
    await newTask.save()

    await Board.findByIdAndUpdate(parsedBoardId, {
      $push: { tasks: newTask._id },
    })
    const convertedTask: TaskType = {
      id: newTask._id.toString(),
      title: newTask.title,
      order: newTask.order,
    }
    return convertedTask
  } catch (error) {
    console.log('데이터베이스 에러: ', error)
    throw new Error('할일 생성 실패')
  }
}

export async function updateTaskTitle(data: TaskType) {
  const parsedData = TaskSchema.pick({ id: true, title: true }).parse(data)
  try {
    await connectDB()
    const updatedTask = await Task.findByIdAndUpdate(
      parsedData.id,
      { title: parsedData.title },
      { new: true },
    )
    revalidatePath('/')
    if (!updatedTask) {
      return { error: 'Task not found' }
    }
  } catch (error) {
    console.log('데이터베이스 에러: ', error)
    throw new Error('할일 수정 실패')
  }
}

export async function deleteTask(id: string) {
  const parsedId = z.string().parse(id)
  try {
    await connectDB()
    const deletedTask = await Task.findByIdAndDelete(parsedId)
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
  const data = { title: '' }
  try {
    await connectDB()
    const newBoard = new Board(data)
    await newBoard.save()
    revalidatePath('/')
    return newBoard._id.toString()
  } catch (error) {
    console.log('데이터베이스 에러: ', error)
    throw new Error('보드 생성 실패')
  }
}

export async function updateBoardTitle(data: BoardType) {
  const parsedData = BoardSchema.pick({ id: true, title: true }).parse(data)
  try {
    await connectDB()
    const updatedBoard = await Board.findByIdAndUpdate(
      parsedData.id,
      { title: parsedData.title },
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
  const parsedId = z.string().parse(id)
  try {
    await connectDB()

    const board = await Board.findById(parsedId).populate('tasks')
    if (!board) {
      return { error: 'Board not found' }
    }

    const taskIds = board.tasks?.map((task: TaskType) => task.id)
    await Task.deleteMany({ _id: { $in: taskIds } })

    const deletedBoard = await Board.findByIdAndDelete(parsedId)
    if (!deletedBoard) {
      return { error: 'Board not found' }
    }
  } catch (error) {
    console.log('데이터베이스 에러: ', error)
    throw new Error('보드 삭제 실패')
  }
  revalidatePath('/')
}

export async function updateBoardOrder(boardId: string, newOrder: number) {
  try {
    await connectDB()
    await Board.findByIdAndUpdate(boardId, { order: newOrder })
  } catch (error) {
    console.error('Error updating board order:', error)
    throw new Error('Failed to update board order')
  }
}

export async function updateTaskOrder(taskId: string, newOrder: number) {
  const parsedData = z
    .object({
      taskId: z.string(),
      newOrder: z.number().min(0),
    })
    .parse({ taskId, newOrder })
  try {
    await connectDB()
    await Task.findByIdAndUpdate(parsedData.taskId, {
      order: parsedData.newOrder,
    })
  } catch (error) {
    console.error('Error updating task order:', error)
    throw new Error('Failed to update task order')
  }
}

export async function updateTaskBoard(
  taskId: string,
  fromBoardId: string,
  toBoardId: string,
) {
  const parsedData = z
    .object({
      taskId: z.string(),
      fromBoardId: z.string(),
      toBoardId: z.string(),
    })
    .parse({ taskId, fromBoardId, toBoardId })
  try {
    await connectDB()
    // 테스크를 기존 보드에서 제거
    await Board.findByIdAndUpdate(parsedData.fromBoardId, {
      $pull: { tasks: parsedData.taskId },
    })

    // 테스크를 새로운 보드에 추가
    await Board.findByIdAndUpdate(parsedData.toBoardId, {
      $push: { tasks: parsedData.taskId },
    })
  } catch (error) {
    console.error('Error updating task board:', error)
    throw new Error('Failed to update task board')
  }
}
