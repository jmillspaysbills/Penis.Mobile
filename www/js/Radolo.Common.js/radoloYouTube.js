/// <reference path="radoloCommon.js" />

function onYouTubeIframeAPIReady() {
    $.radoloYouTube.playerReady = true;
}

$.extend({
    //Loads external templates from path and injects in to page DOM
    radoloYouTube: {
        playerReady: false,
        getVideoDuration: function (videoData) {
            var hours = Math.floor(videoData.entry.media$group.yt$duration.seconds / 60 / 60);
            var minutes = Math.floor(videoData.entry.media$group.yt$duration.seconds / 60);
            var seconds = (videoData.entry.media$group.yt$duration.seconds % 60);

            return hours + ':' + kendo.toString(minutes, '00') + ':' + kendo.toString(seconds, '00');
        },
        getVideoData: function (VideoDataUrl, callback) {
            $.ajax({
                cache: true,
                async: true,
                type: "GET",
                dataType: "jsonp",
                contentType: "application/json; charset=utf-8",
                url: VideoDataUrl,
                success: callback
            });
        },
        getPlayer: function (options, callback) {

            options = $.extend({
                elementID: null,
                videoID: null,
                width: '100%',
                events: null
            }, options);

            if (!options.elementID) { throw 'Please provide an elementID to getPlayer.'; }
            if (!options.videoID) { throw 'Please provide an videoID to getPlayer.'; }                      

            if ($.radoloYouTube.playerReady) {
                if (callback) {
                    callback(new YT.Player(options.elementID, {
                        width: options.width,
                        videoId: options.videoID,
                        events: options.events
                    }));
                } else {
                    new YT.Player(options.elementID, {
                        width: options.width,
                        videoId: options.videoID,
                        events: options.events
                    });
                }
            }
            else {
                setTimeout(function () { $.radoloYouTube.getPlayer(options, callback) }, 50);
            }
        }
    }
});