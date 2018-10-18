import { success, notFound, authorOrAdmin } from '../../services/response/'
import { Story } from '.'
import { getStoryData, downloadChapters } from '../../services/scraper'

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
      story.chapters = storyData.chapters.reverse();
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
    .then((stories) => stories.map((story) => story.general_view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Story.findById(params.id)
    .populate('user')
    .then(notFound(res))
    .then((story) => story ? story.view() : null)
    .then(success(res))
    .catch(next)

export const download_chapters = async ({ params }, res, next) => {
  let story = await Story.findById(params.id)
    //.populate('user')
    .then(notFound(res))
    //.then((story) => story.download_chapters())
    //.then(success(res))
    .catch(next)
  //let result = await downloadChapters(story);
  console.log("Prechapter");
  // Is it already downloading?
  if(story.downloading){
    res.status(200);
    res.send(story.view());
  }
  else{
    // Mark story as currently being downloaded
    res.status(200);
    res.send(story.view());
    story.downloading  = true;
    await story.save();
    let result = await downloadChapters(story);
    if(result == true){
      // Mark all chapters as downloaded
      var chapters = story.chapters;
      for(var i = 0; i<chapters.length; i++){
        chapters[i].downloaded = true;
      }
      await Object.assign(story, {chapters: chapters}).save()
    }
    // Mark as not downloading
    story.downloading  = false;
    await story.save();
  }
}

export const update = ({ user, bodymen: { body }, params }, res, next) => {
  Story.findById(params.id)
    .populate('user')
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'user'))
    .then((story) => story ? Object.assign(story, body).save() : null)
    .then((story) => story ? story.view(true) : null)
    .then(success(res))
    .catch(next)
  // Now we should get the new data
}

export const destroy = ({ user, params }, res, next) =>
  Story.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'user'))
    .then((story) => story ? story.remove() : null)
    .then(success(res, 204))
    .catch(next)