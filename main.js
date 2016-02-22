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
			'onReady': onPlayerReady
		}
	});
	// Add event listeners to the HTML form
	$('loop-times').addEventListener('submit', updateTimes(player));
    $('reset-times').addEventListener('click', function() {
        resetTimes(player);
        updateTimes(player)();
    });
    // Start/End set buttons
    $('loop-set-start').addEventListener('click', function() {
        var currTime = player.getCurrentTime();
        $('startTime').value = secondsToTime(currTime);
    });
    $('loop-set-end').addEventListener('click', function() {
        var currTime = player.getCurrentTime();
        $('endTime').value = secondsToTime(currTime);
    });
    // Show/hide QR code
    $('qr-button').addEventListener('click', function() {
        updateQRCode();
        $('qrcontainer').style.opacity = 1;
        $('qrcontainer').style.visibility = 'visible';
    });
    $('qrcontainer').addEventListener('click', function() {
        if($('qrcontainer').style.visibility == 'visible')
        {
            $('qrcontainer').style.opacity = 0;
            $('qrcontainer').style.visibility = 'hidden';
        }
    });
	// Update the loop times once before the video runs
	updateTimes(player)();
}

// Reset the loop endpoints
function resetTimes(player) {
    var p = getURLParams();
    if(p.startTime)
    {
        $("startTime").value = p.startTime;
    } else {
        $("startTime").value = secondsToTime(0);
    }
    if(p.endTime)
    {
        $("endTime").value = p.endTime;
    } else {
        $("endTime").value = secondsToTime(player.getDuration());
    }
    console.log($("endTime").value);
}

// Start the playback loop
function startLoop(player) {
    var start = timeToSeconds($("startTime").value);
    if(player.seekTo)
        player.seekTo(start, true);
}

// Shamelessly stolen from jQuery
function $(id) {
	return document.getElementById(id);
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
	event.target.playVideo();
	// Get start and end times out of the URL parameters
    resetTimes(event.target)
	// Start the video clock
	setInterval(videoTick(event.target), 150);
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
            startLoop(player);
		}
	}
}

// Update the loop times and seek to the start of the loop
function updateTimes(player)
{
	// Closure over the player variable
	return function() {
		var startTime = timeToSeconds($('startTime').value);
		var endTime = timeToSeconds($('endTime').value);
        var duration = 86400; // 24 hours is a good maximum
        if(player.getDuration)
            duration = player.getDuration();
        // Start time must be non-negative and < video length
        if(startTime < 0 || startTime >= duration)
            startTime = 0;
		$("startTime").value = secondsToTime(startTime);
        // End time must be after start time and <= video length
        if(endTime <= startTime || endTime > duration)
            endTime = duration;
		$("endTime").value = secondsToTime(endTime);
        startLoop(player)
	};
}

// Update the QR code
function updateQRCode() {
    var videoID = getURLParams().v;
    var startTime = timeToSeconds($('startTime').value);
    var endTime = timeToSeconds($('endTime').value);
    var url = 'https://www.youtubeencore.com/watch?v=' + videoID + '&startTime=' + secondsToTime(startTime) + '&endTime=' + secondsToTime(endTime);
    var qrType = Math.ceil(url.length/18);
    var qr = qrcode(qrType, 'M');
    qr.addData(url);
    qr.make();
    qr.drawOnCanvas($('qrcanvas'), 8);
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
    if(colonPos > -1)
    	return t.slice(0,colonPos) * 60 + t.slice(colonPos+1) * 1;
    return t * 1;
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
