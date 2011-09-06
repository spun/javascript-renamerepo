var url_search = "http://www.goear.com/search/";
var goear_url = "http://www.goear.com/";


function goear_extractFromTitle(lineIn, titleIn) {

	var parts = lineIn.split('Escuchar ');
	var author = parts[1].split(titleIn+" de ")[1];

	var song = new Array();
	song[0] = titleIn;
	song[1] = author;

	return song;
}

function goear_getResultsFromText(text) {

	$('#resultList').html("");

	$("#searchImg").css("display", "none");
	$("#loader").css("display", "block");
	$.get( url_search+text+"/" , function(resText) {

		var search = new Object();
		search.text = text;
		var results = new Array();

		$("a.b1", resText).each(
			function(index){
				if($(this).attr("href"))
				{
					var dataSong = goear_extractFromTitle($(this).attr('title'), $(this).text());
					var id = getId($(this).attr("href"));

					/*$('<span>', {
						text: '('+dataSong[1]+')'
					}).appendTo(
						$("<li>", {
							draggable: true,
							text: dataSong[0],
							click: function() {
								preview_sendToPlay(id);
							}
						}).appendTo('#resultList')
					);
					*/
					var songObject = new Object();
					songObject.title = dataSong[0];
					songObject.author = dataSong[1];
					songObject.id = id;

					results.push(songObject);
				}
			}
		);

		search.results = results;

		showSearchResults(search);

		//		localStorage.setItem('lastSearch', JSON.stringify(search));

		$("#loader").css("display", "none");
		$("#searchImg").css("display", "block");
	});
}
/*
function getLocationFromUrl(url) {
	var id = getId(url);
	getUrl(id);
}
*/
function getId(direccionActual)
{
	var id="";
	var fragmentos=direccionActual.split('/');
	var numTrozos=fragmentos.length;

	for(i=0; i<numTrozos; i++)
	{
		if(fragmentos[i]=="listen")
		{
			id=fragmentos[i+1];
		}
	}
	return id;
}


function getUrl(idSong, fback)
{
	$.ajax({
		type: "GET",
		url: "http://www.goear.com/tracker758.php?f="+idSong,
		dataType: "html",
		success: function(texto) {
			extraerDatos(texto, fback);
		}
	});
}

function extraerDatos(datos, fback)
{
	var fragmentos=datos.split('path="');
	var pathfrag=fragmentos[1].split('"');
	var direcc=pathfrag[0];

	fragmentos=datos.split('title="');
	pathfrag=fragmentos[1].split('"');
	var title=pathfrag[0];

	fragmentos=datos.split('artist="');
	pathfrag=fragmentos[1].split('"');
	var artist=pathfrag[0];

	fback(direcc);
}
