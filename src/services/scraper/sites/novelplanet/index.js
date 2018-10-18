const cheerio = require('cheerio')

export const novelplanet = {
  getTitle: function($) {
    return $('.post-contentDetails .title').text();
  },
  getMetadata: function($) {
    let metadataHtml = $('.post-contentDetails .infoLabel');
    let metadata = new Object();
    metadataHtml.each(function(i, elem) {
      // Name of attribute
      let attributeName = $(this).text().replace(':', '').trim().replace(' ', '_').toLowerCase();
      let attributeValue = "";
      // Get the siblings
      let siblings = $(this).nextAll();
      if(siblings.length == 0){ // Usually a number display
        attributeValue = $(this).parent().text().split(":")[1].trim();
      }
      else{
        attributeValue = [];
        siblings.each(function(j, elem) {
          attributeValue.push($(this).text().trim());
        });
      }
      // Store it
      metadata[attributeName] = attributeValue;
    });
    // Now get the bio (which is two nodes after the metadata)
    metadata['bio'] = $('.post-contentDetails').next().next().text().trim();
    return metadata;
  },
  getChapters: function($) {
    // Get the chapters
    let chapters = [];
    let chaptersHTML = $("h3:contains('Chapter list')").nextAll();
    if(chaptersHTML.length != 0){
      chaptersHTML.each(function(i, elem) {
        // Get the values
        let chapterObject = new Object();
        let chapterLink = $(this).find("a");
        let chapterDate = $(this).find(".date");
        // Clean it up
        chapterObject.title = chapterLink.text().trim();
        chapterObject.url   = chapterLink.attr("href");
        chapterObject.upload_date   = chapterDate.text().replace('(', '').replace(')', '');
        chapterObject.downloaded = false;
        // Add it to the array
        chapters.push(chapterObject);
      });
    }
    return chapters;
  },
  getStoryData:  async function(page){
    try {
      // Wait until it loads
      await page.waitFor('.post-contentDetails');
      // Get all the html
      let bodyHTML = await page.evaluate(() => document.body.innerHTML);
      const $ = cheerio.load(bodyHTML);
      let storydata = new Object();
      storydata.title = this.getTitle($);
      storydata.metadata = this.getMetadata($);
      console.log(storydata.metadata);
      storydata.chapters = this.getChapters($);
      return storydata;
    } catch (error) {
      console.log(error)
      return error;
    } 
  },
  getChapterContent: async function(page){
    try {
      // Wait until it loads
      await page.waitFor('#divReadContent');
      // Get all the html
      let bodyHTML = await page.evaluate(() => document.body.innerHTML);
      const $ = cheerio.load(bodyHTML);
      var chapterHtml = $("#divReadContent");
      let chapterText = this.removeAds(chapterHtml).html().trim();
      return chapterText;
    } catch (error) {
      console.log(error)
      return error;
    } 
  },
  removeAds: function(text){
    // Remove all nodes inside that are iframes
    text.find("iframe").remove();
    // TODO: Get a better check. Maybe some stories do use divs?
    text.find("div").remove();
    return text;
  }
}