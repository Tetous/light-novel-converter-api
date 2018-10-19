import { Story } from '.'
import { User } from '../user'

let user, story

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  story = await Story.create({ user, url: 'test', title: 'test', working: false, status: 'downloaded', metadata: [], chapters: [], cover: 'test' })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = story.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(story.id)
    expect(view.title).toBe(story.title)
    expect(typeof view.user).toBe('object')
    expect(view.user.id).toBe(user.id)
    expect(view.url).toBe(story.url)
    expect(view.working).toBe(story.working)
    expect(view.status).toBe(story.status)
    expect(view.metadata).toBe(story.metadata)
    expect(view.chapters).toBe(story.chapters)
    expect(view.cover).toBe(story.cover)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = story.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(story.id)
    expect(view.title).toBe(story.title)
    expect(typeof view.user).toBe('object')
    expect(view.user.id).toBe(user.id)
    expect(view.url).toBe(story.url)
    expect(view.working).toBe(story.working)
    expect(view.status).toBe(story.status)
    expect(view.metadata).toBe(story.metadata)
    expect(view.chapters).toBe(story.chapters)
    expect(view.cover).toBe(story.cover)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
