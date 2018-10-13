import { scraperAddress } from '../../config'
require('url')

const puppeteer = require('puppeteer-core')
const fs = require('fs')
const possibleSites = require('../../services/scraper/sites');

function getSiteFromUrl(url){
	return new URL(url).host.split('.')[0]
}

export const getStoryData = async (story) => {
	try{
		// Get the site from the story
		let site = getSiteFromUrl(story.url);
		// Use the site-specific scraper to get the data
		const browser = await puppeteer.connect({ browserWSEndpoint: scraperAddress });
	  const page = await browser.newPage();
	  await page.goto(story.url);
	  // Get the result
	  let result = await possibleSites[0][site].getStoryData(page);
	  return result;
	  await browser.close();
	} catch(error){
		return error;
	}
	
}