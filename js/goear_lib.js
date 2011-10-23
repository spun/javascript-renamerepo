var url_search = "http://www.goear.com/search/";
var goear_url = "http://www.goear.com/";


function goear_getResultsFromText(text) {

	$('#resultList').html("");

	$("#searchImg").css("display", "none");
	$("#loader").css("display", "block");
	$.get( url_search+text+"/" , function(resText) {

		var search = new Object();
		search.text = text;
		var results = new Array();

		$("ol#results li", resText).each(function(index){
			var data_link = $("a:first", this);

			var id = getId($(data_link).attr("href"));

			var songObject = new Object();
			songObject.title = $("span.song", data_link).text();
			songObject.author = $("span.group", data_link).text();
			songObject.id = id;

			results.push(songObject);
		});

		search.results = results;
		showSearchResults(search);

		$("#loader").css("display", "none");
		$("#searchImg").css("display", "block");

	});
}


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
