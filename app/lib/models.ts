import mongoose, { Schema, model, models, Model } from 'mongoose'
import { BoardType, TaskType } from './type'

const TaskSchema = new Schema({
  title: { type: String },
  order: { type: Number, default: 0 },
})

const BoardSchema = new Schema({
  title: { type: String },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  order: { type: Number, default: 0 },
})

TaskSchema.pre('save', async function (next) {
  if (this.isNew) {
    const highestOrderTask = await mongoose.models.Task.findOne()
      .sort('-order')
      .exec()
    this.order = highestOrderTask ? highestOrderTask.order + 1 : 1
  }
  next()
})

BoardSchema.pre('save', async function (next) {
  if (this.isNew) {
    const highestOrderBoard = await mongoose.models.Board.findOne()
      .sort('-order')
      .exec()
    this.order = highestOrderBoard ? highestOrderBoard.order + 1 : 1
  }
  next()
})

export const Task: Model<TaskType> =
  models.Task || model<TaskType>('Task', TaskSchema)
export const Board: Model<BoardType> =
  models.Board || model<BoardType>('Board', BoardSchema)
