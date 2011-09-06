var bg_page = chrome.extension.getBackgroundPage();


$(document).ready(function() {


	$('#searchForm').submit(function() {
		searchText($('#searchInput').val());
		return false;
	});

	$('#searchForm img').click(function() {
		searchText($('#searchInput').val());
		return false;
	});

	$("#searchInput").focusin(function() {
         $("#searchForm").css('border-color','#0FA6F7');
         $(this).select();
    });

    $("#searchInput").mouseup(function(e){
        e.preventDefault();
	});

	$("#searchInput").focusout(function() {
         $("#searchForm").css('border-color','gray');
    });

	$("#searchInput").focus();

	bg_page.getSelectedText(setTextInput);


	/* TIME COUNTER*/
	if(bg_page.audioElement.src) {
		var s = parseInt(bg_page.audioElement.currentTime % 60);
		if(s<10)
			s="0"+s;
		var m = parseInt((bg_page.audioElement.currentTime / 60) % 60);
		if(m<10)
			m="0"+m;
		$("#time_counter").html(m + ':' + s);
		
		var progress=(bg_page.audioElement.currentTime*100)/bg_page.audioElement.duration;
		$("#inside_progressbar").css("width", progress+"%");
	}

	bg_page.audioElement.addEventListener("timeupdate", function() {
		var s = parseInt(bg_page.audioElement.currentTime % 60);
		if(s<10)
			s="0"+s;
		var m = parseInt((bg_page.audioElement.currentTime / 60) % 60);
		if(m<10)
			m="0"+m;
		$("#time_counter").html(m + ':' + s);

		var total = bg_page.audioElement.duration;
		if(bg_page.audioElement.currentTime>0)
		{
			var progress=(bg_page.audioElement.currentTime*100)/bg_page.audioElement.duration;
			$("#inside_progressbar").css("width", progress+"%");			
		}
		else
			$("#inside_progressbar").css("width", "0%");

		$("#inside_loadbar").css("width", "100%");
		var end = bg_page.audioElement.buffered.end(0);
		if(total!=end) {
			$("#inside_loadbar").css("width", (bg_page.audioElement.buffered.end(0)/total)*100+"%");
		}
		
	}, false);


	var outside = document.getElementById('outside_progressbar');
    var inside = document.getElementById('inside_progressbar');

	outside.addEventListener('click', function(e) {

		if(bg_page.audioElement.src)
		{
			inside.style.width = e.offsetX + "px";

			// calculate the %
			var pct = Math.floor((e.offsetX / outside.offsetWidth) * 100);
			bg_page.audioElement.currentTime = (bg_page.audioElement.duration*pct)/100;
		}

	}, false);


	/* PLAY - PAUSE */

	if(bg_page.audioElement.paused) {
		$("#playPause").attr("src","img/play_icon.png");
	}
	else {
		$("#playPause").attr("src","img/pause_icon.png");
	}

	$("#playPause").click(function() {
		var action="";
		if(bg_page.audioElement.src && bg_page.audioElement.paused)
		{
			action="play";
			$("#playPause").attr("src","img/pause_icon.png");
		}
		else
		{
			action="pause";
			$("#playPause").attr("src","img/play_icon.png");
		}
		sendRequestToBackground(action, "nodata");

	});


	/* STOP */

	$("#stop").click(function() {
		sendRequestToBackground("stop", "nodata");
		$("#playPause").attr("src","img/play_icon.png");
	});

	/* VOLUME */

	var volume = document.getElementById('volume');
	volume.addEventListener('change', function(){
		bg_page.audioElement.volume = parseFloat(this.value / 100);
		$('#volumeInfo').html(volume.value);
	}, false);


	// Ajustamos el volumen actual
	volume.value = bg_page.audioElement.volume * 100;
	$("#volumeInfo").html(volume.value);


	bg_page.audioElement.addEventListener('progress',function ()
	{
		var v = bg_page.audioElement;
		var r = v.buffered;
		var total = v.duration;

		var start = r.start(0);
		var end = r.end(0);

		$("#inside_loadbar").css("width", (end/total)*100+"%");
	});


	$('#repeatPlaylist').click(function() {

		if(localStorage.getItem('repeatPlaylist') == 'on')
		{
			localStorage.setItem('repeatPlaylist', 'off');
			$('#repeatPlaylist').removeClass('on');
		}
		else
		{
			localStorage.setItem('repeatPlaylist', 'on');
			$('#repeatPlaylist').addClass('on');
		}
	});


	recoverLastSession();


	bg_page.audioElement.addEventListener('play', function() {
		$("#playPause").attr("src","img/pause_icon.png");
		$('#playList li').removeClass('playing');
		$('#playList li').eq(bg_page.playListSong).addClass('playing');
		
		
	});

	bg_page.audioElement.addEventListener('pause', function() {
		$("#playPause").attr("src","img/play_icon.png");
	});

	bg_page.audioElement.addEventListener('durationchange', function() {

		var s = parseInt(bg_page.audioElement.duration % 60);
		if(s<10)
			s="0"+s;
		var m = parseInt((bg_page.audioElement.duration / 60) % 60);
		if(m<10)
			m="0"+m;
		$("#songTotalTime").html(m + ':' + s);
	});



});


function searchText(text) {
	goear_getResultsFromText(text);
}


function setTextInput(text) {
	$('#searchInput').val(text);
}


function preview_sendToPlay(title, author, id) {

	// Añadimos la cancion a la lista de reproduccion
	$('<span>', {
		text: '('+author+')'
	}).appendTo(
		$('<li>').attr('draggable', true).
			click(function(){
				sendRequestToBackground("changeTo", $(this).index())
			}).
			html(title).
			data({
				pos: $('#playList li').size(),
				title: title,
				author: author,
				id: id,
			}).appendTo('#playList ul').css("display", "none").fadeIn()
	);


	var song = new Object();
	song.title = title;
	song.author = author;
	song.id = id;

	// La mandamos al array de canciones en background
	chrome.extension.sendRequest({action: "addToPlaylist", url: song}, function(response) {
			//console.log(response.farewell);
	});
}

function sendRequestToBackground(act, data) {

	chrome.extension.sendRequest({action: act, url: data}, function(response) {
			//console.log(response.farewell);
	});
}

var test;
function recoverLastSession() {


	// Recuperamos la ultima busqueda
	if(localStorage.getItem('lastSearch'))
	{
		showSearchResults(JSON.parse(localStorage.getItem('lastSearch')));

	}

	// Recuperamos la lista de reproduccion actual
	$.each(bg_page.playList, function(i) {

	$('<span>', {
		text: '('+$(this)[0].author+')'
		}).appendTo(
			$('<li>').attr('draggable', true).
				click(function(){
					sendRequestToBackground("changeTo", $(this).index())
				}).
				html($(this)[0].title).
				data({
					pos: i,
					title: $(this)[0].title,
					author: $(this)[0].author,
					id: $(this)[0].id,
				}).appendTo('#playList ul')
		);
	});

	// Marcamos la cancion que se esta reproduciendo
	$('#playList li').removeClass('playing');
	$('#playList li').eq(bg_page.playListSong).addClass('playing');


	//Marcamos el estado de repeticion de la lista de reproduccion
	if(localStorage.getItem('repeatPlaylist') == 'on')
	{
		$('#repeatPlaylist').addClass('on');
	}
	else
	{
		$('#repeatPlaylist').removeClass('on');
	}
}

function showSearchResults(searchResults)
{
	var numResults = searchResults.results.length;

	if(numResults > 0)
	{
		$('#resultList').html("");

		$.each(searchResults.results, function(i) {

			$('<span>', {
				text: '('+$(this)[0].author+')'
			}).appendTo(
				$('<li>').attr('draggable', true).
					attr('onclick', 'preview_sendToPlay("'+$(this)[0].title+'","'+$(this)[0].author+'","'+$(this)[0].id+'")').
					html($(this)[0].title).appendTo('#resultList')
			);
		});


		localStorage.setItem('lastSearch', JSON.stringify(searchResults));
	}
}

