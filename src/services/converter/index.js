const fs = require('fs')
const concat = require('concat')
const exec = require('await-exec')

export const convertStory = async (story, force=false) => {
	try{
		// Create the folder for the story
		let folderName = process.cwd() + "/converted/" + story.url.split('/').slice(-1)[0];
		if (!fs.existsSync(folderName)){
		    await fs.mkdirSync(folderName);
		}
		// Create final file
		let finalPath = folderName + "/story.html"
		// Iterate through all chapters
		let chaptersFolder =  process.cwd() + "/downloaded/" + story.url.split('/').slice(-1)[0];
		var chapterFileList =  [];
		for(var i = 0; i<story.chapters.length; i++){
			chapterFileList.push(chaptersFolder + "/Chapter" + (i+1) + ".html");
		}
		await concat(chapterFileList, finalPath);
		
		// Now we convert it
		console.log("Starting conversion");

		var convertionOptions = {
		  input: '"' + finalPath + '"',
		  output: '"' + folderName + '/' + story.title + '.mobi"',
		  title: '"' + story.title + '"',
		  book_producer: '"LnConverter"',
		  publisher: "'" + story.metadata['translator'].join('&') +"'",
		  authors: "'" + story.metadata['author'].join('&') +"'",
		  output_profile: 'kindle_dx',
		  bio: '"' + story.metadata['bio'] + '"',
		  language: 'en'
		}
		// Check for the cover
		if(story.cover !== "undefined"){
			convertionOptions.cover = story.cover;
		}

  	await exec(`
  		ebook-convert ${convertionOptions.input} ${convertionOptions.output} --output-profile ${convertionOptions.output_profile} --title ${convertionOptions.title} --publisher ${convertionOptions.publisher} --authors ${convertionOptions.authors} --comments ${convertionOptions.bio} --book-producer ${convertionOptions.book_producer} --language ${convertionOptions.language} --cover ${convertionOptions.cover}
  	`);

		console.log("Done!");
		return true;
	} catch(error){
		console.log(error);
		return error;	
	}
}