import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, update, destroy, download_chapters } from './controller'
import { schema } from './model'
export Story, { schema } from './model'

const router = new Router()
const { url, metadata, bio, cover } = schema.tree

/**
 * @api {post} /stories Create story
 * @apiName CreateStory
 * @apiGroup Story
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam url Story's url.
 * @apiParam metadata Story's metadata.
 * @apiParam bio Story's bio.
 * @apiParam cover Story's cover.
 * @apiSuccess {Object} story Story's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Story not found.
 * @apiError 401 user access only.
 */
router.post('/',
  token({ required: true }),
  body({ url, metadata, bio, cover }),
  create)

/**
 * @api {get} /stories Retrieve stories
 * @apiName RetrieveStories
 * @apiGroup Story
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Object[]} stories List of stories.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get('/',
  token({ required: true }),
  query(),
  index)

/**
 * @api {get} /stories/:id Retrieve story
 * @apiName RetrieveStory
 * @apiGroup Story
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess {Object} story Story's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Story not found.
 * @apiError 401 user access only.
 */
router.get('/:id',
  token({ required: true }),
  show)

/**
 * @api {get} /stories/:id/download_chapters Download chapters
 * @apiName DownloadChaptersStory
 * @apiGroup Story
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess {Bool} result Chapters downloaded
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Story not found.
 * @apiError 401 user access only.
 */
router.get('/:id/download_chapters',
  token({ required: true }),
  download_chapters)

/**
 * @api {put} /stories/:id Update story
 * @apiName UpdateStory
 * @apiGroup Story
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam url Story's url.
 * @apiParam metadata Story's metadata.
 * @apiParam bio Story's bio.
 * @apiParam cover Story's cover.
 * @apiSuccess {Object} story Story's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Story not found.
 * @apiError 401 user access only.
 */
router.put('/:id',
  token({ required: true }),
  body({ url, metadata, bio, cover }),
  update)

/**
 * @api {delete} /stories/:id Delete story
 * @apiName DeleteStory
 * @apiGroup Story
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Story not found.
 * @apiError 401 user access only.
 */
router.delete('/:id',
  token({ required: true }),
  destroy)

export default router
