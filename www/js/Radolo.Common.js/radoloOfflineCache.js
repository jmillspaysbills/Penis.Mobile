/// <reference path="radoloCommon.js" />

//UNCACHED (numeric value 0)
//The ApplicationCache object's cache host is not associated with an application cache at this time.

//IDLE (numeric value 1)
//The ApplicationCache object's cache host is associated with an application cache whose application cache group's update status is idle, and that application cache is the newest cache in its application cache group, and the application cache group is not marked as obsolete.

//CHECKING (numeric value 2)
//The ApplicationCache object's cache host is associated with an application cache whose application cache group's update status is checking.

//DOWNLOADING (numeric value 3)
//The ApplicationCache object's cache host is associated with an application cache whose application cache group's update status is downloading.

//UPDATEREADY (numeric value 4)
//The ApplicationCache object's cache host is associated with an application cache whose application cache group's update status is idle, and whose application cache group is not marked as obsolete, but that application cache is not the newest cache in its group.

//OBSOLETE (numeric value 5)
//The ApplicationCache object's cache host is associated with an application cache whose application cache group is marked as obsolete.


//IE hates the console unless it is open...
if (typeof (console) === 'undefined' || !console || !window.console) {
    console = {
        warn: function () { },
        log: function () { }
    };
}
if (!console.warn) {
    console.warn = function () { };
}
if (!console.log) {
    console.log = function () { };
}

if (typeof (showElapsedTime) === 'undefined') {
    var showElapsedTime = function (title) {
        startTime = typeof startTime === 'undefined' ? new Date().getTime() : startTime;

        var elapsed = (new Date().getTime() - startTime);
        var msg = (elapsed / 1000) + " : " + title;

        console.log(msg);
    };
}

(function ($) {
    ///<param name="$" type="jQuery" />      

    var deferNoChanges = $.Deferred();
    var deferChangesAvailable = $.Deferred();
    var deferCached = $.Deferred();
    var deferChangesDownloaded = $.Deferred();
    var deferDownloadError = $.Deferred();

    var radoloOfflineCache = {        
        noChanges: deferNoChanges.promise(),
        cached: deferCached.promise(),
        changesAvailable: deferChangesAvailable.promise(),
        changesDownloaded: deferChangesDownloaded.promise(),
        downloadError: deferDownloadError.promise()        
    };  
    
    var cached =function(){
        showElapsedTime('cached');
        //these are not real changes so just move forward
        deferCached.resolve();
    };

    var checking = function () {
        showElapsedTime('checking');
    };    
    
    var downloading =function(){
        showElapsedTime('downloading');
        deferChangesAvailable.resolve();
    };     

    var handleError =function(){
        showElapsedTime('handleError');
        deferDownloadError.resolve();
    };     

    var noupdate =function(){
        showElapsedTime('noupdate');
        deferNoChanges.resolve();
    };     

    var obsolete =function(){
        showElapsedTime('obsolete');
    };     

    var progress =function(){
        showElapsedTime('progress');
    };     

    var updateready =function(){
        showElapsedTime('updateready');
        deferChangesDownloaded.resolve();
    };     


    if (window.applicationCache) {
        var appCache = window.applicationCache;

        showElapsedTime(appCache.status);

        // Fired after the first cache of the manifest.
        appCache.addEventListener('cached', cached, false);

        // Checking for an update. Always the first event fired in the sequence.
        appCache.addEventListener('checking', checking, false);

        // An update was found. The browser is fetching resources.
        appCache.addEventListener('downloading', downloading, false);

        // The manifest returns 404 or 410, the download failed,
        // or the manifest changed while the download was in progress.
        appCache.addEventListener('error', handleError, false);

        // Fired after the first download of the manifest.
        appCache.addEventListener('noupdate', noupdate, false);

        // Fired if the manifest file returns a 404 or 410.
        // This results in the application cache being deleted.
        appCache.addEventListener('obsolete', obsolete, false);

        // Fired for each resource listed in the manifest as it is being fetched.
        appCache.addEventListener('progress', progress, false);

        // Fired when the manifest resources have been newly redownloaded.
        appCache.addEventListener('updateready', updateready, false);
    } else {
        //we have no appcache so just bail
        noupdate();
    }

    $.extend({
        radoloOfflineCache: radoloOfflineCache
    });
})(jQuery);