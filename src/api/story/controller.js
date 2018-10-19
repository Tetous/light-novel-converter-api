import { success, notFound, authorOrAdmin } from '../../services/response/'
import { Story } from '.'
import { getStoryData, downloadChapters } from '../../services/scraper'
import { convertStory } from '../../services/converter'

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
      story.status   = 'scraped';
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

export const download = async ({ params }, res, next) => {
  let story = await Story.findById(params.id)
    .then(notFound(res))
    .catch(next)
  console.log("Preparing to download");
  // Is it already working?
  if(story.working){
    console.log("WOAH there, already working");
    res.status(200);
    res.send(story.view());
  }
  else{
    // Mark story as currently being downloaded
    res.status(200);
    res.send(story.view());
    story.working  = true;
    await story.save();
    let result = await downloadChapters(story);
    console.log("Download result: " + result)
    if(result === true){
      // Mark all chapters as downloaded
      console.log("Yeah!");
      var chapters = story.chapters;
      // TODO: They're not being marked because of async
      for(var i = 0; i<chapters.length; i++){
        chapters[i].downloaded = true;
      }
      story.chapters = chapters;
      //await Object.assign(story, {chapters: chapters}).save()
    }
    // Mark as not working
    story.status = 'downloaded';
    story.working  = false;
    await story.save();
  }
}

export const convert = async ({ params }, res, next) => {
  let story = await Story.findById(params.id)
    .then(notFound(res))
    .catch(next)

  //Is it downloading or converting??
  if(story.working){
    res.status(200);
    res.send(story.view());
  }
  else{
    // Mark story as currently being converting
    res.status(200);
    res.send(story.view());
    story.working  = true;
    await story.save();
    let result = await convertStory(story);
    if(result == true){
      console.log("Converted!");
    }
    // Mark as not downloading
    story.working  = false;
    story.status = 'converted';
    await story.save();
  }
}

export const get_result = async ({ params }, res, next) => {
  let story = await Story.findById(params.id)
    .then(notFound(res))
    .catch(next)

  //Is it downloading or converting??
  if(story.working){
    res.status(200);
    res.send(story.view());
  }
  else{
    var file = process.cwd() + "/converted/" + story.url.split('/').slice(-1)[0] + '/' + story.title + '.mobi';
    res.status(200).download(file);
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