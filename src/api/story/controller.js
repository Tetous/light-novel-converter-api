import { success, notFound, authorOrAdmin } from '../../services/response/'
import { Story } from '.'
import { getStoryData } from '../../services/scraper'

export const create = async ({ user, bodymen: { body } }, res, next) => {
  let possibleError = null;
  let story = await Story.create({ ...body, user })
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).json({
          valid: false,
          param: 'url',
          message: 'url already used in a story'
        })
        possibleError = err;
      } else {
        next(err)
      }
    })
    .catch(next)
  // Was a new one created?
  if(story){ // Yes
    // Lets get the story data
    let storyData = await getStoryData(story);
    
    if(storyData instanceof Error){ // Did we get any errors?
      res.status(500);
      res.send(storyData);
    }
    else{
      story.chapters = storyData.chapters;
      story.metadata = storyData.metadata;
      story.title    = storyData.title;
      await story.save();
      // Then send the response
      success(res, 200);
      res.send(story.view(true));
    }
  }
}

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Story.find(query, select, cursor)
    .populate('user')
    .then((stories) => stories.map((story) => story.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Story.findById(params.id)
    .populate('user')
    .then(notFound(res))
    .then((story) => story ? story.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ user, bodymen: { body }, params }, res, next) =>
  Story.findById(params.id)
    .populate('user')
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'user'))
    .then((story) => story ? Object.assign(story, body).save() : null)
    .then((story) => story ? story.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ user, params }, res, next) =>
  Story.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'user'))
    .then((story) => story ? story.remove() : null)
    .then(success(res, 204))
    .catch(next)