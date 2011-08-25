try {
    // Object to hold information about the current page
	var selectedText = '';
	if (window.getSelection) {
	  selectedText = window.getSelection().toString();
	}
	if (selectedText == '') {
	  var frames = document.getElementsByTagName("iframe");
	  for (var i = 0; i < frames.length; i++) {
		if (selectedText == '') {
		  selectedText = frames[i].contentDocument.getSelection().toString();
		}
		else { break; }
	  }
	}
    // Send the information back to the extension
    chrome.extension.sendRequest({action: "putSelection", url: selectedText}, function(response) {
		console.log(response.farewell);
	});
}
catch (e) {
    // do nothing
}
