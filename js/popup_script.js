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
	}

	bg_page.audioElement.addEventListener("timeupdate", function() {
		var s = parseInt(bg_page.audioElement.currentTime % 60);
		if(s<10)
			s="0"+s;
		var m = parseInt((bg_page.audioElement.currentTime / 60) % 60);
		if(m<10)
			m="0"+m;
		$("#time_counter").html(m + ':' + s);
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



	recoverLastSession();
	
	
	bg_page.audioElement.addEventListener('play', function() {
		$('#playList li').removeClass('playing');
		$('#playList li').eq(bg_page.playListSong).addClass('playing');		
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
			attr('onclick', 'sendRequestToBackground("changeTo",'+$('#playList li').size()+')').
			html(title).appendTo('#playList ul').css("display", "none").fadeIn()
	);


	var song = new Object();
	song.title = title;
	song.author = author;
	song.id = id;

	// La mandamos al array de canciones en background
	chrome.extension.sendRequest({action: "addToPlaylist", url: song}, function(response) {
			$("#playPause").attr("src","img/pause_icon.png");
			console.log(response.farewell);
	});
}

function sendRequestToBackground(act, data) {

	chrome.extension.sendRequest({action: act, url: data}, function(response) {
			console.log(response.farewell);
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
				attr('onclick', 'sendRequestToBackground("changeTo",'+i+')').
				html($(this)[0].title).appendTo('#playList ul')
		);
	});
	
	// Marcamos la cancion que se esta reproduciendo
	$('#playList li').removeClass('playing');
	$('#playList li').eq(bg_page.playListSong).addClass('playing');	
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
