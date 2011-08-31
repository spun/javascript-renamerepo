var callbacks = [];
var playList = new Array();
var playListSong = 0;

var audioElement = document.createElement('audio');
audioElement.load();


audioElement.addEventListener('ended', function() {
	playListSong++;
	if(!(playListSong < playList.length))
		playListSong = 0;
	getUrl(playList[playListSong].id);
});


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {

	console.log(sender.tab ?
		"from a content script:" + sender.tab.url :
		"from the extension");
		if(request.action == "putSelection") {
			var callback = callbacks.shift();
			callback(request.url);
			sendResponse({farewell: "goodbye"});
		}
		else if(request.action == "change") {
			audioElement.pause();
			console.log("Cambiando a: "+request.url);
			getUrl(request.url);

			sendResponse({farewell: "goodbye"});
		}
		else if(request.action == "changeTo") {
			audioElement.pause();
			console.log("Cambiando a la cancion: "+request.url);

			playListSong = request.url;
			if(!(playListSong < playList.length))
				playListSong = 0;
			getUrl(playList[playListSong].id);

			sendResponse({farewell: "goodbye"});
		}
		else if (request.action == "addToPlaylist")
		{
			playList.push(request.url);
			if(playList.length==1)
				getUrl(request.url.id);

			sendResponse({farewell: "goodbye"});

		}
		else if (request.action == "play")
		{
			audioElement.play();
			console.log("played");
			sendResponse({farewell: "goodbye"});

		}
		else if(request.action == "pause")
		{
			audioElement.pause();
			console.log("paused");
			sendResponse({farewell: "goodbye"});
		}
		else if(request.action == "stop")
		{
			audioElement.pause();
			audioElement.currentTime=0;
			sendResponse({farewell: "goodbye"});
		}
		else if(request.action == "change") {
			audioElement.pause();
			audioElement.src=request.url;
			audioElement.play();
			sendResponse({farewell: "goodbye"});
		}
		else
			sendResponse({}); // snub them.
});


function getSelectedText(callback)
{
	callbacks.push(callback);
	chrome.tabs.executeScript(null, {
		file: "js/selection_script.js"
	});
}


function changeSong(enlace) {
	audioElement.pause();
	audioElement.src = enlace;
	audioElement.play();

	return false;
}










