import { scraperAddress } from '../../config'
require('url')

const puppeteer = require('puppeteer-core')
const fs = require('fs')
const possibleSites = require('../../services/scraper/sites');

function getSiteNameFromUrl(url){
	return new URL(url).host.split('.')[0]
}

function getSiteFromUrl(url){
	return new URL(url).origin
}

export const getStoryData = async (story) => {
	try{
		// Get the site from the story
		let site = getSiteNameFromUrl(story.url);
		// Use the site-specific scraper to get the data
		const browser = await puppeteer.connect({ browserWSEndpoint: scraperAddress });
	  const page = await browser.newPage();
	  await page.goto(story.url);
	  // Get the result
	  let result = await possibleSites[0][site].getStoryData(page);
	  await browser.close();
	  return result;
	} catch(error){
		return error;
	}
}

export const downloadChapters = async (story, force=false) => {
		// Create the folder for the story
		let folderName = process.cwd() + "/downloaded/" + story.url.split('/').slice(-1)[0];
		if (!fs.existsSync(folderName)){
		    await fs.mkdirSync(folderName);
		}
		// Prepare the scraper
		let site = getSiteNameFromUrl(story.url);
		let baseUrl = getSiteFromUrl(story.url);
		var browser = await puppeteer.connect({ browserWSEndpoint: scraperAddress });
		var page = await browser.newPage();
		// Lets just set the check at 9 to test
		// TODO: Put this as env variable, with a default
		const timeoutCheck = 8;
	try{
		// Get all the chapters
		for(var i = 0; i<story.chapters.length; i++){
			let chapter = story.chapters[i];
			// This is a check so that every X pages we force Puppeteer to reconnect
			// This is because after a random number of pages visited, it auto-disconnects
			if(i != 0 && i%timeoutCheck == 0){
				await browser.close();
				browser = await puppeteer.connect({ browserWSEndpoint: scraperAddress });
				page = await browser.newPage();
			}
			// TODO: Check if we already have it
			// Unless it was forced
      await page.goto(baseUrl+chapter.url);
      let result = await possibleSites[0][site].getChapterContent(page);
      // Write it to file
      await fs.writeFile(folderName + "/Chapter" + (i+1) +".html", result, function(err) {
			    if(err) {
			        console.log(err);
			    }
			}); 
	    }
	  console.log("All chapters downloaded");
		await browser.close();
		return true;
	} catch(error){
		console.log(error);
		return error;
	}
}