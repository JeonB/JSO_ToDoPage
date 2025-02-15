import { Schema, model, models, Model } from 'mongoose'
import { BoardType, TaskType } from './type'

const TaskSchema = new Schema({
  title: { type: String },
})

const BoardSchema = new Schema({
  name: { type: String },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
})

export const Task: Model<TaskType> =
  models.Task || model<TaskType>('Task', TaskSchema)
export const Board: Model<BoardType> =
  models.Board || model<BoardType>('Board', BoardSchema)
