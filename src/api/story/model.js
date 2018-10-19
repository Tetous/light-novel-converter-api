import mongoose, { Schema } from 'mongoose'
import { getMetadata } from '../../services/scraper'
import { downloadChapters } from '../../services/scraper'

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
  working: {
    type: Boolean,
    default: false
  },
  status: {
    type: String
  },
  metadata: {
    type: Object
  },
  chapters: {
    type: Array
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
      working: this.working,
      current_status: this.status,
      metadata: this.metadata,
      chapters: this.chapters,
      cover: this.cover,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  },
  general_view (full) {
    const view = {
      id: this.id,
      title: this.title,
      url: this.url,
      working: this.working,
      current_status: this.status,
      chapter_count: this.chapters.length,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  },
  download_chapters (full) {
    downloadChapters(this)
    return true
  }
}

const model = mongoose.model('Story', storySchema)

export const schema = model.schema
export default model
