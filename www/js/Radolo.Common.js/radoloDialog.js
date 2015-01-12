/// <reference path="radoloCommon.js"/>

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

(function ($) {
    /// <param name="$" type="jQuery" />  

    var getButtonContent = function (idBase, buttons) {
        var but = null;
        var content = '';
        for (var i in buttons) {
            but = buttons[i];

            var classes = typeof but.classes === 'undefined' ? '' : ' ' + but.classes;

            but.id = idBase + '_' + i;
            content += '<button class="k-button' + classes + '" id="' + but.id + '">' + but.title + '</button>';
        }

        return content;
    }

    var setTipWindowPosition = function (options, offsets) {

        if (!options.event) throw "event must be defined";

        offsets = $.extend({ x: 300, y: 15 }, offsets);

        var $targ = $(options.event.target);

        var pos = $targ.offset();

        var offsetX = offsets.x;
        var offsetY = offsets.y; //determines how high should the tip window appear above the clicked point

        var tipWindow = this.element.closest(".k-window");
        var mainWindow = options.event.view || window; //if we do not have an event view then just grab the main window        
        var winWidth = mainWindow.document.documentElement.scrollWidth;
        var clickX = pos.left;
        var clickY = pos.top;
        var tipWindowX = clickX - tipWindow.width() / 2;
        var tipWindowY = clickY - tipWindow.height();
        if (tipWindowX < 0) tipWindowX = 0;
        if (tipWindowX + tipWindow.width() > winWidth) tipWindowX = winWidth - tipWindow.width();

        var top = tipWindowY - offsetY;
        if (top < 40) {
            top = $targ.height() + pos.top + offsetY;
            $(this.element).addClass("flipped");
        }

        tipWindow.css({
            top: top,
            left: tipWindowX - offsetX,
            width: tipWindow.width()
        });
    }

    //to hide the close button use                     showClose:{}
    
    $.extend({
        radoloDialog: {
            openTip: null,
            openHoverTip: null,
            windowStack: [],
            addWindowToStack: function (window) {
                if (window == null) return;
                $.radoloDialog.windowStack.push(window);

                return window;
            },
            isInStack: function (window) {
                if (window == null) return false;

                if ($.radoloDialog.windowStack == null) return false;

                var len = $.radoloDialog.windowStack.length;

                if (len == 0) return false;

                return $.radoloDialog.windowStack[len - 1] === window;
            },
            closeWindow: function (callback) {
                //pop the last window off the stack
                var win = $.radoloDialog.windowStack.pop();
                if (win == null) return;

                //close the window
                if (callback) {
                    win.bind("deactivate", callback)
                }

                //actually close
                win.close();
            },
            showUrlWindow: function (options) {
                var evt = window.event;

                options = $.extend({}, {
                    title: "What's My Title?!",
                    url: "#",
                    showClose: null,
                    iframe: false
                }, options);

                if (url === '#') {
                    throw 'Missing options.url';
                }

                var title = options.title;
                var url = options.url;
                var win = $("<div class='modal-window'/>");
                var height = options.height;
                var width = options.width;
                var contentType = options.data ? 'POST' : 'GET';
                var data = options.data;
                var actions = options.showClose || ["Close"];

                // window not yet initialized
                var tmpwin = win.kendoWindow({
                    actions: actions,
                    content: { type: contentType, url: url, data: data },
                    title: title,
                    draggable: true,
                    modal: true,
                    resizable: false,
                    scrollable: true,
                    height: height,
                    width: width,
                    iframe: options.iframe,
                    animation: {
                        open: {
                            effects: { fadeIn: {} },
                            duration: 200,
                            show: true
                        },
                        close: {
                            effects: { fadeOut: {} },
                            duration: 200,
                            hide: true
                        }
                    },
                    refresh: function (e) {
                        tmpwin.center();
                    },
                    deactivate: function () {
                        //we need to make sure we are removing from the stack if appropriate
                        if ($.radoloDialog.isInStack(tmpwin)) {
                            $.radoloDialog.windowStack.pop();
                        }
                        
                        //lets make sure we get rid of the whole thing                
                        this.element.closest(".k-window").remove();

                        this.destroy();
                    }
                }).data("kendoWindow");


                tmpwin.center().open();


                $.radoloDialog.addWindowToStack(tmpwin);

                return false;
            },
            showAsWindow: function (options) {
                var idBase = new Date().getTime();

                options = $.extend({}, { "title": "Confirm",
                    "message": "Click OK to continue.",
                    showClose: null,
                    classes: null,
                    "buttons": [{ "title": "OK", "callback": null}]
                }, options);

                //wrap in <p> if text only
                var regex = /(<([^>]+)>)/ig;

                if (options.message.search(regex) < 0) {
                    options.message = '<p>' + options.message + '</p>'
                }

                var actions = options.showClose || {};

                var content = "<div class='k-content kendo-confirm'> <div class='dialogMessage'>" + options.message + "</div>";

                content = content + "<div class='dialogButtons'>";

                content += getButtonContent(idBase, options.buttons);

                content += "</div></div>";

                var height = options.height;
                var width = options.width;

                // window not yet initialized
                var tmpwin = $("<div class='radoloDialog' id='" + idBase + "'/>").kendoWindow({
                    title: options.title,
                    resizable: false,
                    modal: true,
                    actions: actions,
                    height: height,
                    width: width,
                    refresh: function (e) {
                        tmpwin.center();
                    },
                    deactivate: function () {
                        //we need to make sure we are removing from the stack if appropriate
                        if ($.radoloDialog.isInStack(tmpwin)) {
                            $.radoloDialog.windowStack.pop();
                        }

                        this.destroy();

                        //lets make sure we get rid of the whole thing                
                        this.element.closest(".k-window").remove();
                    }
                }).data("kendoWindow");

                //we need to wrap our content and then add any special classes
                if (options.classes) {
                    //to get the full html back we need to wrap it and then get the html from the new parent
                    content = $(content).addClass(options.classes).wrap('<div/>').parent().html();
                }

                tmpwin.content(content).center().open();

                $.each(options.buttons, function (index, button) {
                    $.radoloCommon.bindClick($("#" + button.id), function (e) {
                        if (button.callback) {
                            button.callback(e);
                        } else {
                            $.radoloDialog.closeWindow();
                        }
                    });
                });

                return $.radoloDialog.addWindowToStack(tmpwin);
            },
            showAsTip: function (options) {
                if (typeof options === 'undefined' || options === null || typeof options.event === 'undefined' || options.event === null) {
                    throw "You must provide options with a valid triggering event.";
                }

                options.event.stopPropagation();

                if ($.radoloDialog.openTip) { $.radoloDialog.openTip.close(); }

                var idBase = new Date().getTime();

                options = $.extend({}, { "event": window.event || arguments.callee.caller.arguments[0],
                    autoClose: false,
                    "message": "Click OK to continue.",
                    "buttons": [{ "title": "OK", "callback": null}]
                }, options);

                var content = "<div class='tip-bottom'></div><div class='k-content kendo-confirm'><div class='dialogMessage'>" + options.message + "</div>";

                content += "<div class='dialogButtons'>";

                content += getButtonContent(idBase, options.buttons);

                content += "</div>";

                // window not yet initialized
                var kendoWindow = $("<div class='radoloDialog tip innerBox' id='" + idBase + "'/>").kendoWindow({
                    title: false,
                    resizable: false,
                    modal: false,
                    draggable: false,
                    resizable: false,
                    actions: {},
                    open: function () { setTipWindowPosition.call(this, options, { x: 113, y: 15 }) },
                    deactivate: function () {
                        this.destroy();
                        //lets make sure we get rid of the whole thing                
                        this.element.closest(".k-window").addClass("outerBox").remove();
                    },
                    close: function () {
                        $(document).off('click.radoloDialog');
                        $.radoloDialog.openTip = null;
                    }
                });

                $.radoloDialog.openTip = kendoWindow.data("kendoWindow")
				.content(content)
				.open();
                
                $.each(options.buttons, function (index, button) {
                    $.radoloCommon.bindClick($("#" + button.id), function (e) {
                        if (button.callback) {
                            button.callback(e);
                        } else {
                            kendoWindow.data("kendoWindow").close();
                        }
                    });
                });

                $(document).on('click.radoloDialog', function (e) {
                    var windowContainer = $('#' + idBase).parent();
                    if (windowContainer.has(event.target).length === 0) {
                        if (options.autoClose) {
                            if ($.radoloDialog.openTip) {
                                $.radoloDialog.openTip.close();
                            }
                        }
                    }
                });
                return $.radoloDialog.openTip;
            },
            showAsTipOnHover: function (options) {
                if (typeof options === 'undefined' || options === null || typeof options.event === 'undefined' || options.event === null) {
                    throw "You must provide options with a valid triggering event.";
                }

                options.event.stopPropagation();

                if ($.radoloDialog.openHoverTip) { $.radoloDialog.openHoverTip.close(); }

                var idBase = new Date().getTime();

                options = $.extend({}, { "event": window.event || arguments.callee.caller.arguments[0],
                    "message": "Hover information"
                }, options);

                var content = "<div class='tip-bottom hover'></div><div class='k-content kendo-confirm'> <p class='dialogMessage'>" + options.message + "</p></div></div>";

                // window not yet initialized
                var kendoWindow = $("<div class='radoloDialog tip hover' id='" + idBase + "'/>").kendoWindow({
                    title: false,
                    resizable: false,
                    modal: false,
                    draggable: false,
                    resizable: false,
                    actions: {},
                    open: function () { setTipWindowPosition.call(this, options, { x: 0, y: 20 }) },
                    deactivate: function () {
                        this.destroy();
                        //lets make sure we get rid of the whole thing                
                        this.element.closest(".k-window").remove();
                    },
                    close: function () {
                        $.radoloDialog.openHoverTip = null;
                    }
                });

                $.radoloDialog.openHoverTip = kendoWindow.data("kendoWindow")
				.content(content)
				.open();

                return $.radoloDialog.openHoverTip;
            }
        }
    });
})(jQuery);

/*
Usage example for showAsTipOnHover:
var win = null;
$('#linkTest1').hover(function (e) {
win = $.radoloDialog.showAsTipOnHover({
event: e,
message: "Hover information here!",
buttons: []
});
}, function (e) { if (win) win.close(); });

*/