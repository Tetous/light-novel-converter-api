import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Story } from '.'

const app = () => express(apiRoot, routes)

let userSession, anotherSession, story

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const anotherUser = await User.create({ email: 'b@b.com', password: '123456' })
  userSession = signSync(user.id)
  anotherSession = signSync(anotherUser.id)
  story = await Story.create({ user })
})

test('POST /stories 201 (user)', async () => {
  const { status, body } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: userSession, url: 'test', metadata: 'test', bio: 'test', cover: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.url).toEqual('test')
  expect(body.metadata).toEqual('test')
  expect(body.bio).toEqual('test')
  expect(body.cover).toEqual('test')
  expect(typeof body.user).toEqual('object')
})

test('POST /stories 401', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /stories 200 (user)', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
    .query({ access_token: userSession })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(typeof body[0].user).toEqual('object')
})

test('GET /stories 401', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /stories/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${story.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(story.id)
  expect(typeof body.user).toEqual('object')
})

test('GET /stories/:id 401', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/${story.id}`)
  expect(status).toBe(401)
})

test('GET /stories/:id 404 (user)', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
    .query({ access_token: userSession })
  expect(status).toBe(404)
})

test('PUT /stories/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`${apiRoot}/${story.id}`)
    .send({ access_token: userSession, url: 'test', metadata: 'test', bio: 'test', cover: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(story.id)
  expect(body.url).toEqual('test')
  expect(body.metadata).toEqual('test')
  expect(body.bio).toEqual('test')
  expect(body.cover).toEqual('test')
  expect(typeof body.user).toEqual('object')
})

test('PUT /stories/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${story.id}`)
    .send({ access_token: anotherSession, url: 'test', metadata: 'test', bio: 'test', cover: 'test' })
  expect(status).toBe(401)
})

test('PUT /stories/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${story.id}`)
  expect(status).toBe(401)
})

test('PUT /stories/:id 404 (user)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456')
    .send({ access_token: anotherSession, url: 'test', metadata: 'test', bio: 'test', cover: 'test' })
  expect(status).toBe(404)
})

test('DELETE /stories/:id 204 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${story.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(204)
})

test('DELETE /stories/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${story.id}`)
    .send({ access_token: anotherSession })
  expect(status).toBe(401)
})

test('DELETE /stories/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${story.id}`)
  expect(status).toBe(401)
})

test('DELETE /stories/:id 404 (user)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456')
    .query({ access_token: anotherSession })
  expect(status).toBe(404)
})
