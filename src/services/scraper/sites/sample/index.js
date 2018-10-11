// Cheerio is the html parser
const cheerio = require('cheerio')

export const novelplanet = {
  getTitle: function($) {
    return "";
  },
  getMetadata: function($) {
    return [];
  },
  getChapters: function($) {
    return [];
  },
  getStoryData:  async function(page){
    // Get all the html
    let bodyHTML = "";
    const $ = cheerio.load(bodyHTML);
    let storydata = new Object();
    storydata.title = this.getTitle($);
    storydata.metadata = this.getMetadata($);
    storydata.chapters = this.getChapters($);
    return storydata;
  }
}