'use server'

import { z } from 'zod'
import { connectDB } from './mongodb'
import { Task, Board } from './models'
import { TaskType, BoardType } from './type'
import { revalidatePath } from 'next/cache'

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
  const data = { title: '' }
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

export async function updateBoardTitle(data: BoardType) {
  try {
    await connectDB()
    const updatedBoard = await Board.findByIdAndUpdate(
      data.id,
      { title: data.title },
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
    await Task.deleteMany({ _id: { $in: taskIds } })

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
  try {
    await connectDB()
    await Task.findByIdAndUpdate(taskId, { order: newOrder })
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
  try {
    await connectDB()

    // 테스크를 기존 보드에서 제거
    await Board.findByIdAndUpdate(fromBoardId, {
      $pull: { tasks: taskId },
    })

    // 테스크를 새로운 보드에 추가
    await Task.findByIdAndUpdate(taskId, { boardId: toBoardId })
    await Board.findByIdAndUpdate(toBoardId, {
      $push: { tasks: taskId },
    })
  } catch (error) {
    console.error('Error updating task board:', error)
    throw new Error('Failed to update task board')
  }
}
