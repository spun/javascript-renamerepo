var callbacks = [];
var playList = new Array();
var playListSong = 0;

var audioElement = document.createElement('audio');
audioElement.load();


audioElement.addEventListener('ended', function() {
	playListSong++;
	if(!(playListSong < playList.length))
	{
		playListSong = 0;
		if(localStorage.getItem('repeatPlaylist') == 'on')
		{
			getUrl(playList[playListSong].id, changeSong);
		}
		else
		{
			getUrl(playList[playListSong].id, stopPlaylist);
		}

	}
	else
		getUrl(playList[playListSong].id, changeSong);
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
			getUrl(request.url, changeSong);

			sendResponse({farewell: "goodbye"});
		}
		else if(request.action == "changeTo") {
			audioElement.pause();

			playListSong = request.url;
			if(!(playListSong < playList.length))
				playListSong = 0;
			getUrl(playList[playListSong].id, changeSong);

			sendResponse({farewell: "goodbye"});
		}
		else if (request.action == "addToPlaylist")
		{
			playList.push(request.url);
			if(playList.length==1)
				getUrl(request.url.id, changeSong);

			sendResponse({farewell: "goodbye"});

		}
		else if (request.action == "play")
		{
			audioElement.play();
			sendResponse({farewell: "goodbye"});

		}
		else if(request.action == "pause")
		{
			audioElement.pause();
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

function stopPlaylist(enlace) {
	audioElement.pause();
	audioElement.src = enlace;
	audioElement.play();
	audioElement.pause();
	audioElement.currentTime=0;
	return false;
}









