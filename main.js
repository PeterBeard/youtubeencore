var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
	var videoID = getURLParams().v;
	player = new YT.Player('player', {
		height: '566',
		width: '960',
		videoId: videoID,
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
	event.target.playVideo();
	// Get start and end times out of the URL parameters
	var p = getURLParams();
	if(p.startTime)
	{
		document.getElementById("startTime").value = p.startTime;
	}
	if(p.endTime)
	{
		document.getElementById("endTime").value = p.endTime;
	}
	// Start the video clock
	setInterval(videoTick, 150);
}

// The API calls this function when the player's state changes.
var initEndTime = false;
function onPlayerStateChange(event)
{
	if (event.data == YT.PlayerState.PLAYING && !initEndTime) {
		if(document.getElementById("endTime").value == "0:00")
		{
			document.getElementById("endTime").value = secondsToTime(player.getDuration());
		} else {
			document.getElementById("endTime").value = secondsToTime(timeToSeconds(document.getElementById("endTime").value));
		}
		initEndTime = true;
		updateTimes();
	}
}

// Keep track of our position in the video and restart playback at the correct time
function videoTick()
{
	var t = player.getCurrentTime();
	var end = timeToSeconds(document.getElementById("endTime").value);
	var start = timeToSeconds(document.getElementById("startTime").value);
	// Return to the beginning of the loop period
	if(t >= end && end > start)
	{
		player.seekTo(start, true);
	}
}

// Update the loop times and seek to the start of the loop
function updateTimes()
{
	var videoID = getURLParams().v;
	var startTime = secondsToTime(timeToSeconds(document.getElementById('startTime').value));
	var endTime = secondsToTime(timeToSeconds(document.getElementById('endTime').value));
	document.getElementById("startTime").value = startTime;
	document.getElementById("endTime").value = endTime;
	player.seekTo(timeToSeconds(startTime), true);
	// Create a QR code for sharing and such
	var url = 'http://www.youtubeencore.com/watch?v=' + videoID + '&startTime=' + startTime + '&endTime=' + endTime;
	var qrType = Math.ceil(url.length/18);
	var qr = qrcode(qrType, 'M');
	qr.addData(url);
	qr.make();
	document.getElementById('qrcode').innerHTML = qr.createImgTag();
}

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
	return t.substring(0,colonPos) * 60 + t.substring(colonPos+1) * 1;
}
// Get GET parameters
function getURLParams()
{
	var prmstr = window.location.search.substr(1);
	var prmarr = prmstr.split ("&");
	var params = {};
	
	for ( var i = 0; i < prmarr.length; i++) {
		var tmparr = prmarr[i].split("=");
		params[tmparr[0]] = tmparr[1];
	}
	return params;
}

