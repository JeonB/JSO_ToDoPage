import mongoose, { Schema, model, models } from 'mongoose'

const TaskSchema = new Schema({
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo',
  },
})

const BoardSchema = new Schema({
  _id: mongoose.Types.ObjectId,
  name: { type: String, required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
})

export const Task = models.Task || model('Task', TaskSchema)
export const Board = models.Board || model('Board', BoardSchema)
