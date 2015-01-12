/// <reference path="radoloCommon.js" />

//in order for the router to work it makes a few assumptions about convention
//every page must have a swappableContentMasterApplication element, within that element
//that element must contain all of the scripts that are required for that page to run

//IE hates the console unless it is open...
if (!window.console) {
    console = {};
    window.console = console;
}

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
    /// <param name="$" type="jQuery" /> 

    var _radoloRouterQueue = $.Deferred();
    _radoloRouterQueue.resolve(); //just kick this off so our first time through is immediate

    window.onpopstate = function (e) {
        //console.warn('on popstate');

        var state = e.state;

        if (!state) {
            var safari = kendo.support.browser.safari;
            var oldChrome = kendo.support.browser.chrome && kendo.support.browser.version < 34; //34 is when they fixed their popstate bug
            if (safari || oldChrome) {
                //console.warn('pushing current page since safari and old browsers sucks');

                //this is our first page so just push this state and url
                var url = $.radoloCommon.getCurrentUrlPath();

                state = {
                    url: url,
                    swapTarget: '',
                    timeStamp: new Date().getTime()
                };

                $.radoloRouter.fromPopState = false;
                $.radoloRouter.previousStamp = state.timeStamp;

                history.pushState(state, null, url);
                return;
            } else {
                //console.warn('no state');
                state = {
                    url: $.radoloCommon.getCurrentUrlPath(),
                    swapTarget: '',
                    timeStamp: null
                };
            }
        }

        $.radoloRouter.fromPopState = true;

        var timeStamp = state.timeStamp;
        if (timeStamp && $.radoloRouter.previousStamp <= timeStamp) {
            $.radoloRouter.goingForward = true;
        } else {
            $.radoloRouter.goingForward = false;
        }

        showElapsedTime('previous timeStamp ' + $.radoloRouter.previousStamp);
        showElapsedTime('timeStamp ' + timeStamp);
        showElapsedTime($.radoloRouter.previousStamp <= timeStamp);
        showElapsedTime('-------------------------');

        $.radoloRouter.previousStamp = timeStamp;

        //this fires after the window has changed the url
        //so we need to use the state that came in
        //we want to skip push because the url has already changed at this point
        $.radoloRouter.loadUrl(state.url, true, state.swapTarget);
    };


    //get our old content
    var getOldContentElement = function (swapTargetID) {
        //find the swapTarget
        return document.getElementById(swapTargetID);
    };

    //get our new content
    var getNewContentElement = function (url, swapTarget) {
        var defContent = new $.Deferred();

        //get the new content
        var def = $.get(url);
        def.done(function (html) {
            var surrogate = document.createElement("div");
            surrogate.innerHTML = html;

            //try to find the content that will be doing the replace
            var replaceSwapTarget = surrogate.querySelector(swapTarget);
            if (!replaceSwapTarget) {
                //if we cannot find the exact swap target then we need to reload
                window.location.href = url;

                throw "replaceSwapTarget Not Found (" + replaceSwapTarget + ")";
            }

            var deferredScriptsToLoad = [];

            //get all of the scripts and remove them
            var scriptsOriginal = replaceSwapTarget.querySelectorAll("script");
            for (var i = 0; i < scriptsOriginal.length; i++) {

                var oldScript = scriptsOriginal[i];
                var scrParent = oldScript.parentNode;

                scrParent.removeChild(oldScript);

                //now lets create the script
                var newScript = document.createElement("script");

                newScript.text = oldScript.text;

                for (var iAttribute = 0; iAttribute < oldScript.attributes.length; iAttribute++) {
                    var att = oldScript.attributes[iAttribute];

                    //add everything but the src attribute since we are manually going to pop that in there
                    if (att.name.toLowerCase() === 'src') {
                        //this script has a src so track it so we can notify when it is done
                        var defScript = $.Deferred();

                        //we need to wrap this in a closure so the defScript in the function is not the last script processed
                        (function (defScript, newScript) {
                            newScript.onload = function () {
                                defScript.resolve();
                            };
                            newScript.onerror = function () {
                                defScript.reject();
                            };
                        })(defScript, newScript);

                        deferredScriptsToLoad.push(defScript);
                    }

                    newScript.setAttribute(att.name, att.value);
                }

                replaceSwapTarget.appendChild(newScript);
            }

            //send up the new content and any scripts that will be loaded
            defContent.resolve({ elemNewContent: replaceSwapTarget, deferredScriptsToLoad: deferredScriptsToLoad });

        }).fail(function (err) {
            defContent.reject(err);
        });

        return defContent;
    };

    var swapContent = function (skipPush, url, history, swapTarget, swapTargetID, goingForward) {

        showElapsedTime('swapping');

        var elemOldContent = getOldContentElement(swapTargetID);
        if (!elemOldContent) {
            //we could not find the swap target, lets try and fall back
            swapTarget = $.radoloRouter.defaultSwapTarget;
            swapTargetID = swapTarget.replace("#", "");

            //check again
            elemOldContent = getOldContentElement(swapTargetID);
            if (!elemOldContent) {
                window.location.href = url;
                throw "Could not find swap target";
            }
        }



        var parent = elemOldContent.parentNode;
        var $elemOldContent = $(elemOldContent);

        //lets show progress on what we are swapping out, then when the swap happens it will be normal
        kendo.ui.progress($elemOldContent, true);

        //immediately change our id so it does not get found and yanked
        elemOldContent.setAttribute("id", new Date().getTime());
        showElapsedTime('id changed');
        return new $.Deferred(function (defer) {
            //actually do our swap                 
            showElapsedTime('swapping in deferred');

            //create a temporary a tag so we can get the parsed url from it without query string    
            var newContentURL = document.createElement('a');
            newContentURL.href = url;
            var newContentPath = newContentURL.pathname;
            if (newContentPath[0] !== '/') {
                newContentPath = '/' + newContentPath;
            }

            //get new content
            getNewContentElement(newContentPath, swapTarget).done(function (results) {

                var elemNewContent = results.elemNewContent;

                var deferredScriptsToLoad = results.deferredScriptsToLoad;

                if (!elemNewContent) {

                    window.location.href = url;
                    throw "Could not find new content";

                }

                showElapsedTime('swapping has content');


                kendo.unbind(elemOldContent);

                //update the URL before we insert new content because it could be url dependent
                //unless we want to skip the push
                if (!skipPush && history.pushState) {
                    //console.warn('pushing ' + url);

                    var state = {
                        url: url,
                        swapTarget: swapTarget,
                        timeStamp: $.radoloRouter.previousStamp
                    };

                    $.radoloRouter.previousStamp = new Date().getTime();

                    //before we push, let the previous state know where we are going
                    var oldState = history.state;
                    if (oldState) {
                        oldState.nextState = state;
                        history.replaceState(oldState, null, oldState.url); //replace what we have so we can access it when it pops
                    }

                    history.pushState(state, null, url);
                }

                //there are scenarios where the parent will not exist
                //this usually happens if someone clicks a button before the previous page has loaded
                if (parent !== null) {

                    //remove the id attribute
                    elemOldContent.removeAttribute('id');

                    //remove any previous value
                    elemOldContent.classList.remove($.radoloRouter.classForward);
                    elemOldContent.classList.remove($.radoloRouter.classBackward);

                    //mark the old content for leaving
                    elemOldContent.classList.add($.radoloRouter.classLeaving);

                    //let the new content know we are going forward or backward
                    if (goingForward) {
                        elemNewContent.classList.add($.radoloRouter.classForward);
                    } else {
                        elemNewContent.classList.add($.radoloRouter.classBackward);
                    }

                    //let it know it will be entering
                    elemNewContent.classList.add($.radoloRouter.classEntering);

                    //pop in the new content
                    showElapsedTime('insert');
                    parent.insertBefore(elemNewContent, elemOldContent);

                    //this will execute the transition
                    if (goingForward) {
                        elemOldContent.classList.add($.radoloRouter.classForward);
                    } else {
                        elemOldContent.classList.add($.radoloRouter.classBackward);
                    }

                    //remove the old content, but give it a chance to run any scripts on the page
                    $.when.apply(null, deferredScriptsToLoad).always(function () {
                        showElapsedTime('scriptsloaded');
                        if (parent.contains(elemOldContent)) {
                            showElapsedTime('remove');
                            parent.removeChild(elemOldContent);
                        } else {
                            //console.warn(elemOldContent.parentNode);
                            debugger;
                        }
                        showElapsedTime('showing');
                        elemNewContent.classList.remove($.radoloRouter.classEntering);

                        //let our parents know all is well
                        defer.resolve();
                    });

                } else {
                    debugger;
                }

                //let google know we loaded a page if we are using google
                try {
                    if (ga) {
                        ga('send', 'pageview', url);
                    }
                } catch (e) {
                    //swallow
                }
            }).fail(function () {

                window.location.href = url;
                throw "Could not find swap target";

            });
        });
    };

    var _loadUrl = function (url, skipPush, swapTarget) {
        //validate if we can even use the push and short circuit if we cannot
        //if we do not have these objects available, then short circuit and just go to the new page
        if (!window.history || !history.pushState) {

            window.location.href = (url);

            throw "kill javascript";

        }

        //clean our input
        switch (arguments.length) {
            case 1:
                if (!url) throw "You must provide a url at the minimum";
                skipPush = false;
                swapTarget = $.radoloRouter.defaultSwapTarget;
                break;
            case 2:
                if (typeof arguments[1] == 'boolean' || arguments[1] == 'true' || arguments[1] == "false") {
                    skipPush = arguments[1];
                }
                if (typeof arguments[1] == 'string' && arguments[1] != 'true' && arguments[1] != "false") {
                    swapTarget = arguments[1];
                    skipPush = false;
                }
                break;
            case 3:
                //just accept                        
                break;
            default:
                throw "You must provide a url at the minimum";
        }

        swapTarget = (swapTarget === undefined || swapTarget === "") ? $.radoloRouter.defaultSwapTarget : swapTarget;
        skipPush = skipPush === undefined ? false : skipPush;

        //make sure our swaptargetstarts with a #
        if (swapTarget[0] != '#') {
            swapTarget = '#' + swapTarget;
        }


        //make sure we do not have a #
        var swapTargetID = swapTarget.replace("#", "");

        //check and see if we are going backward
        var fromPopState = $.radoloRouter.fromPopState;
        var goingForward = !fromPopState || $.radoloRouter.goingForward;


        showElapsedTime('loadUrl start');
        showElapsedTime("url to load :" + url);
        showElapsedTime('current url : ' + $.radoloCommon.getCurrentUrlPath().toLowerCase());

        showElapsedTime("fromPopState  :" + fromPopState);
        showElapsedTime("goingForward  :" + goingForward);

        showElapsedTime("skipPush  :" + skipPush);
        showElapsedTime("swapTarget  :" + swapTarget);

        //scroll our body
        setTimeout(function () {
            //put this here because the body may not exist when the router is loaded                
            var _body = $('body');

            var scrollTop = _body.scrollTop();

            if (scrollTop > 150) {
                //console.warn('scrolling');

                _body.animate({
                    scrollTop: 0
                }, 'fast');

            }
        }, 0);

        //check and see if we are loading the same url
        if (!skipPush && $.radoloRouter.isCurrentUrl(url)) {
            showElapsedTime('loadUrl same url requested');
            return $.Deferred().reject({
                url: url,
                reason: "loadUrl same url requested",
                swapTarget: swapTarget
            });
        }

        console.warn('before swapping');

        //get our new defer which will let our caller know that we can continue                
        var defer = $.Deferred();

        var warn =  (typeof($.radoloRouter.warnBeforeLeaving)==='function' && $.radoloRouter.warnBeforeLeaving() ) // if it is a function then execute it
                    || $.radoloRouter.warnBeforeLeaving //not a function but exists so just use it
                   

        //check and see if we should warn before leaving
        // check to see if we should warn the user before we leave the page
        if (warn) {

            //ask them if they really want to leave
            $.radoloDialog.showAsWindow({
                title: "Are We Sure?",
                message: "You are about to leave this page. Are you sure everything has been saved and you want to leave?",
                buttons: [{
                    title: "Leave",
                    callback: function () {
                        //we need to assume that each page decides if it requires a warning before leaving
                        //so lets let it make a decision before we leave
                        $.radoloRouter.warnBeforeLeaving = false;

                        //they wanted to leave so execute the content swap and resolve when we are done                             
                        swapContent(skipPush, url, history, swapTarget, swapTargetID, goingForward).always(function () {
                            defer.resolve();
                        });

                        //close the window since they made their choice
                        $.radoloDialog.closeWindow();
                    }
                }, {
                    title: "Stay",
                    callback: function () {

                        if (history && history.state && history.state.nextState) {
                            //we need to push the state since we are staying
                            //this will combat the last popstate
                            history.pushState(history.state.nextState, null, history.state.nextState.url);
                        }

                        //they want to stay so just resolve
                        defer.resolve();

                        //they made their choice so close
                        $.radoloDialog.closeWindow();
                    }
                }]
            });
        } else {
            //no need to ask them so just execute the swap
            //use this defer instead of the one we created above
            defer = swapContent(skipPush, url, history, swapTarget, swapTargetID, goingForward);
        }

        //attach this to the end of the queue
        return defer;
    };

    $.extend({
        radoloRouter: {
            warnBeforeLeaving: false,
            fromPopState: false,
            goingForward: false,
            previousStamp: null, //this should be null by default since we will know to always go back if it does not exist
            classEntering: "radoloEntering",
            classLeaving: "radoloLeaving",
            classForward: "radoloForward",
            classBackward: "radoloBackward",
            defaultSwapTarget: "#swappableContentMasterApplication",
            isCurrentUrl: function (url) {
                url = url || ""; //clean it up

                var curURL = $.radoloCommon.getCurrentUrlPath();
                return curURL.toLowerCase() === url.toLowerCase();
            },
            clickBackLink: function (e) {
                e.preventDefault();
                e.stopPropagation();

                //if there is nowhere to go back to then just close the window
                if(window.history.length<=1){
                    window.close();
                    return;
                }

                //the clicked the back link, which is explicit and not accidental so do not warn
                $.radoloRouter.warnBeforeLeaving = false;

                $.radoloRouter.fromPopState = true;

                window.history.back();
            },
            clickLink: function (e) {
                showElapsedTime('click Link Start');
                e.preventDefault();
                e.stopPropagation();
                //console.warn('click link');

                var $target = $(e.target);
                var $href = $target.closest('[href]');
                var $url = $target.closest('[data-url]');

                //find the closest item that has an href
                //closest will search itself
                var url = $href.attr('href') || $url.attr('data-url') ;

                //if the ctrl key was pressed then open a in a new window
                if(e.ctrlKey){
                    window.open(url);
                    return;
                }               

                var swapTarget = $href.attr('data-swapTarget') || $.radoloRouter.defaultSwapTarget;
                $.radoloRouter.fromPopState = false;

                return $.radoloRouter.loadUrl(url, false, swapTarget);
            },
            loadUrl: function (url, skipPush, swapTarget) {
                var args = arguments;

                var wrapper = function () {
                    //we want to pass in whatever was passed in
                    return _loadUrl.apply(this, args);
                };

                //we want to run this if it succeeds or fails
                _radoloRouterQueue = _radoloRouterQueue.then(wrapper);
                _radoloRouterQueue.fail(function (err) {
                    console.warn(err);
                    //just queue up a new router chain
                    _radoloRouterQueue = $.Deferred().resolve();
                });

                return _radoloRouterQueue;
            }
        }
    });
})(jQuery);