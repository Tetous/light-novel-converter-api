import { Story } from '.'
import { User } from '../user'

let user, story

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  story = await Story.create({ user, url: 'test', title: 'test', metadata: [], chapters: [], bio: 'test', cover: 'test' })
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
    expect(view.metadata).toBe(story.metadata)
    expect(view.chapters).toBe(story.chapters)
    expect(view.bio).toBe(story.bio)
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
    expect(view.metadata).toBe(story.metadata)
    expect(view.chapters).toBe(story.chapters)
    expect(view.bio).toBe(story.bio)
    expect(view.cover).toBe(story.cover)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
