import connectDB from './mongodb'
import { Board } from './models'
import { BoardType } from './type'
import { unstable_cache } from 'next/cache'

export const getBoards = unstable_cache(
  async () => {
    try {
      await connectDB()
      const boards = await Board.find().populate('tasks').lean()
      const convertedBoards: BoardType[] = boards.map(board => ({
        id: board._id.toString(),
        title: board.title,
        order: board.order, // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tasks: board.tasks?.map((task: any) => ({
          id: task._id.toString(),
          title: task.title,
          order: task.order,
        })),
      }))
      convertedBoards.sort((a, b) => a.order - b.order)
      convertedBoards.forEach(board => {
        if (board.tasks) {
          board.tasks.sort((a, b) => a.order - b.order)
        }
      })
      return convertedBoards
    } catch (error) {
      console.error('Error fetching boards:', error)
      throw new Error('Failed to fetch boards')
    }
  },
  ['boards'],
  { tags: ['boards'], revalidate: 60 },
)
