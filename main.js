// Add the YouTube API to the page.
function addAPITag()
{
	// Create a <script> tag and add it before the first one in the markup
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// The API calls this function when the iFrame is ready
function onYouTubeIframeAPIReady() {
	var player = new YT.Player('player', {
		height: '566',
		width: '960',
		videoId: getURLParams().v,
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
	// Add an event listener to the HTML form
	$('loop-times').addEventListener('submit', updateTimes(player));
}

// Shamelessly stolen from jQuery
function $(id) {
	return document.getElementById(id);
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
	event.target.playVideo();
	// Get start and end times out of the URL parameters
	var p = getURLParams();
	if(p.startTime)
	{
		$("startTime").value = p.startTime;
	}
	if(p.endTime)
	{
		$("endTime").value = p.endTime;
	}
	// Start the video clock
	setInterval(videoTick(event.target), 150);
}

// The API calls this function when the player's state changes.
var initEndTime = false;
function onPlayerStateChange(event)
{
	if (event.data == YT.PlayerState.PLAYING && !initEndTime) {
		if($("endTime").value == "0:00")
		{
			$("endTime").value = secondsToTime(event.target.getDuration());
		} else {
			$("endTime").value = secondsToTime(timeToSeconds($("endTime").value));
		}
		initEndTime = true;
		updateTimes(event.target);
	}
}

// Keep track of our position in the video and restart playback at the correct time
function videoTick(player)
{
	// Use a closure to avoid having a global video player object
	return function()
	{
		var t = player.getCurrentTime();
		var end = timeToSeconds($("endTime").value);
		var start = timeToSeconds($("startTime").value);
		// Return to the beginning of the loop period
		if(t >= end && end > start)
		{
			player.seekTo(start, true);
		}
	}
}

// Update the loop times and seek to the start of the loop
function updateTimes(player)
{
	// Closure over the player variable
	return function() {
		var videoID = getURLParams().v;
		var startTime = secondsToTime(timeToSeconds($('startTime').value));
		var endTime = secondsToTime(timeToSeconds($('endTime').value));
		$("startTime").value = startTime;
		$("endTime").value = endTime;
		player.seekTo(timeToSeconds(startTime), true);
		// Create a QR code for sharing and such
		var url = 'http://www.youtubeencore.com/watch?v=' + videoID + '&startTime=' + startTime + '&endTime=' + endTime;
		var qrType = Math.ceil(url.length/18);
		var qr = qrcode(qrType, 'M');
		qr.addData(url);
		qr.make();
		qr.drawOnCanvas($('qrcanvas'));
	};
}

// Convert a number of seconds to an mm:ss string
function secondsToTime(s)
{
	var minutes = Math.floor(s/60);
	var seconds = Math.floor((s - minutes*60)*100)/100; // Round seconds to the nearest .01
	if(seconds < 10)
	{
		seconds = "0" + seconds;
	}
	return minutes + ":" + seconds;
}

// Convert a time string (minutes:seconds) to a number of seconds
function timeToSeconds(t)
{
	var colonPos = t.indexOf(":");
	return t.slice(0,colonPos) * 60 + t.slice(colonPos+1) * 1;
}

// Get GET parameters
function getURLParams()
{
	var prmstr = window.location.search.substr(1);
	var prmarr = prmstr.split ("&");
	var params = {};
	
	// Iterate over the array of parameters, splitting them on '=' to get names and values
	for (var i = 0; i < prmarr.length; i++)
	{
		var tmparr = prmarr[i].split("=");
		params[tmparr[0]] = tmparr[1];
	}
	return params;
}

// Add the API
addAPITag();

