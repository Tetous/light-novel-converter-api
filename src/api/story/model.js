import mongoose, { Schema } from 'mongoose'
import { getMetadata } from '../../services/scraper'

const storySchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String
  },
  metadata: {
    type: Array
  },
  chapters: {
    type: Array
  },
  bio: {
    type: String
  },
  cover: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

storySchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      title: this.title,
      user: this.user.view(full),
      url: this.url,
      metadata: this.metadata,
      chapters: this.chapters,
      bio: this.bio,
      cover: this.cover,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Story', storySchema)

export const schema = model.schema
export default model
