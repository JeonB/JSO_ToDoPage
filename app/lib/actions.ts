'use server'

import { z } from 'zod'
import connectDB from './mongodb'
import { Task, Board } from './models'
import { TaskType, BoardType } from './type'
import { revalidatePath, revalidateTag } from 'next/cache'
import { AnyBulkWriteOperation } from 'mongoose'

const TaskSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  order: z.number(),
})

const BoardSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  order: z.number(),
  tasks: z.array(TaskSchema).optional(),
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
    revalidatePath('/')
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
    revalidatePath('/')
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
    revalidatePath('/')
    if (!deletedBoard) {
      return { error: 'Board not found' }
    }
  } catch (error) {
    console.log('데이터베이스 에러: ', error)
    throw new Error('보드 삭제 실패')
  }
}

export async function updateBoardAndTasks(updatedBoards: BoardType[]) {
  try {
    await connectDB()
    const validBoards = BoardSchema.array().parse(updatedBoards)
    const boardIds = validBoards.map(board => board.id)
    const existingBoards = await Board.find({ _id: { $in: boardIds } }).lean()
    const validExistingBoards = BoardSchema.array().parse(
      existingBoards.map(board => ({
        id: board._id.toString(), // `_id`를 `id`로 변환
        title: board.title,
        order: board.order,
        tasks: board.tasks?.map(task => ({
          id: task.id.toString(), // `_id`를 `id`로 변환
          title: task.title,
          order: task.order ?? 0, // `order`가 undefined면 기본값 0
        })),
      })),
    )
    const bulkBoardOps: AnyBulkWriteOperation<BoardType>[] = []
    const bulkTaskOps: AnyBulkWriteOperation<TaskType>[] = []

    validBoards.forEach(newBoard => {
      const existingBoard = validExistingBoards.find(
        board => board.id.toString() === newBoard.id,
      )
      if (!existingBoard) return
      // Board가 변경되었는지 확인
      if (
        existingBoard.order !== newBoard.order ||
        existingBoard.title !== newBoard.title
      ) {
        bulkBoardOps.push({
          updateOne: {
            filter: { _id: newBoard.id },
            update: { title: newBoard.title, order: newBoard.order },
          },
        })
      }

      // Task 목록이 변경되었는지 확인
      const existingTaskIds = existingBoard.tasks?.map(task => task.toString())
      const newTaskIds = newBoard.tasks?.map(task => task.id)

      if (JSON.stringify(existingTaskIds) !== JSON.stringify(newTaskIds)) {
        bulkBoardOps.push({
          updateOne: {
            filter: { _id: newBoard.id },
            update: { tasks: newTaskIds },
          },
        })
      }

      // Task 순서 변경 감지
      newBoard.tasks?.forEach((task, index) => {
        if (task.order !== index) {
          bulkTaskOps.push({
            updateOne: {
              filter: { _id: task.id },
              update: { order: index },
            },
          })
        }
      })
    })

    // MongoDB bulkWrite를 활용한 일괄 업데이트
    if (bulkBoardOps.length > 0) {
      await Board.bulkWrite(bulkBoardOps)
    }
    if (bulkTaskOps.length > 0) {
      await Task.bulkWrite(bulkTaskOps)
    }
    revalidateTag('boards')
  } catch (error) {
    console.error('Error updating boards and tasks:', error)
    throw new Error('Failed to update boards and tasks')
  }
}
