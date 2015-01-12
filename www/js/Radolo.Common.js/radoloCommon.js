/// <reference path="../../Kendo/js/jquery.min.js" />
/// <reference path="../../Kendo/js/kendo.all.min.js" />
/// <reference path="radoloDialog.js" />


//IE hates the console unless it is open...
if (!window.console) {
    console = {};
    window.console = console;
}

if (typeof (console) === 'undefined' || !console || !window.console) {
    console = {
        warn: function () { },
        log: function () { },
        error: function () { }
    };
}
if (!console.warn) {
    console.warn = function () { };
}
if (!console.log) {
    console.log = function () { };
}
if (!console.error) {
    console.error = function () { };
}

var showElapsedTime = function (title) {
    startTime = typeof startTime === 'undefined' ? new Date().getTime() : startTime;

    var elapsed = (new Date().getTime() - startTime);
    var msg = (elapsed / 1000) + " : " + title;

    console.log(msg);
};

if (!String.prototype.trim) {
    console.warn('!!!!Adding String TRIM!!!!wow old browser');
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, "");
    };
}

if (!window.localStorage) {
    window.localStorage = {};
}
if (!window.sessionStorage) {
    window.sessionStorage = {};
}

(function ($) {
    /// <param name="$" type="jQuery" />      
    Date.prototype.toJSON = function (key) {

        var epochTime = this.getTime();
        var offset = this.getTimezoneOffset();

        //invert the operator
        var operator = offset <= 0 ? "+" : "-";
        return "\/Date(" + epochTime + ")\/";
        //        return "\/Date(" + epochTime + operator + offset + ")\/";
    };
    Date.prototype.toUTCDateStringForWcfGet = function (key) {

        var offset = this.getTimezoneOffset();

        //invert the operator
        var operator = offset <= 0 ? "+" : "-";

        //convert minutes to a formatted hh:mm, this function takes milli so convert minutes to milli
        //we also need to trim off the seconds
        offset = $.radoloCommon.formatSeconds(offset * 60 * 1000).substr(0, 5);

        //iso 8601 date format
        //we do not use a Z because we include the offset
        return kendo.toString(this.getUTCFullYear(), "0000") + "-" + kendo.toString(this.getUTCMonth() + 1, "00") + "-" + kendo.toString(this.getUTCDate(), "00") + "T" + kendo.toString(this.getUTCHours(), "00") + ":" + kendo.toString(this.getUTCMinutes(), "00") + ":" + kendo.toString(this.getUTCSeconds(), "00") + "." + kendo.toString(this.getUTCMilliseconds(), "000") + operator + offset;
    };

    String.prototype.isEmpty = function() {  
      if (this.length>0 && !/^\s*$/.test(this)) {
        return false;
      } else {
       return true;
      }
    };

    kendo.data.binders.showProgress = kendo.data.Binder.extend({
        refresh: function () {
            var $element = $(this.element);

            //make sure we have a progressContainer class.
            $element.addClass('progressContainer');

            var value = this.bindings.showProgress.get();
            if (value) {
                kendo.ui.progress($element, true);
            } else {
                kendo.ui.progress($element, false);
            }
        }
    });

    kendo.data.binders.addClass = kendo.data.Binder.extend({
        refresh: function () {
            var $element = $(this.element);
            var value = this.bindings.addClass.get();
            if (value) {
                $element.addClass(value);
            }
        }
    });

    //this is designed to just have a hardcoded value placed in the binding
    kendo.data.binders.widget.addPopupClass = kendo.data.Binder.extend({
        refresh: function () {
            var popupClass= this.bindings.addPopupClass.path;
            var list = this.element.list;

            if(popupClass && list){
                //we need to bind to the open
                this.element.popup.bind("open", function() {
                    //we are just going to use the popupclass
                    if(list){
                        list.addClass(popupClass);
                    }
                });
            }
        }
    });

    kendo.data.binders.tooltip = kendo.data.Binder.extend({
        refresh: function () {
            var that = this;
            var $element = $(that.element);

            var tipClass = $element.attr('data-tipclass');
            var callout = $element.attr('data-callout');
            var height = $element.attr('data-height');
            var width = $element.attr('data-width');
            var autoHide = $element.attr('data-auto-hide');
            var position = $element.attr('data-position');

            var source = that.bindings.tooltip.source;
            var value = source;
            var pathParts = that.bindings.tooltip.path.split('.');

            $.each(pathParts, function (index, item) {
                if (value !== null && typeof value !== 'undefined') {
                    value = value[item];
                }
            });

            if(typeof value == 'undefined' && $element){
                value = $element.attr('title');
            }

            if (value) {

                var tt = $element.data().kendoTooltip;

                if (tt) {
                    tt.destroy();
                }

                $element.kendoTooltip({
                    callout: callout,
                    height: height,
                    width: width,
                    autoHide: autoHide,
                    position: position,
                    show: function (e) {
                        this.popup.element.addClass('radoloToolTip');
                        this.popup.element.addClass(tipClass);
                    },
                    content: function () {

                        var $wrapper = $('<div class="radoloToolTipContent"/>');

                        if (typeof value == 'function') {
                            $wrapper.append(value());
                        } else {
                            $wrapper.append(value);
                        }

                        return $('<div/>').append($wrapper).html();
                    }
                });
            }
        }
    });

    kendo.data.binders.widget.tooltip = kendo.data.Binder.extend({
        refresh: function () {
            var that = this;

            var $element = that.element;

            var $tmpElement = $($element.element);

            var tipClass = $tmpElement.attr('data-tipclass');
            var callout = $tmpElement.attr('data-callout');
            var height = $tmpElement.attr('data-height');
            var width = $tmpElement.attr('data-width');
            var autoHide = $tmpElement.attr('data-auto-hide');
            var position = $tmpElement.attr('data-position');

            var binding = that.bindings.tooltip;

            var source = binding.source;
            var value = source;
            var pathParts = binding.path.split('.');

            $.each(pathParts, function (index, item) {
                if (value !== null && typeof value !== 'undefined') {
                    value = value[item];
                }
            });
            
            if(typeof value == 'undefined' && $tmpElement){
                value = $tmpElement.attr('title');
            }

            if (value) {
                var tt = $element.wrapper.data().kendoTooltip;

                if (tt) {
                    tt.destroy();
                }

                $element.wrapper.kendoTooltip({
                    callout: callout,
                    height: height,
                    width: width,
                    autoHide: autoHide,
                    position: position,
                    show: function (e) {
                        this.popup.element.addClass('radoloToolTip');
                        this.popup.element.addClass(tipClass);
                    },
                    content: function () {

                        var $wrapper = $('<div class="radoloToolTipContent"/>');

                        if (typeof value == 'function') {
                            $wrapper.append(value());
                        } else {
                            $wrapper.append(value);
                        }

                        return $('<div/>').append($wrapper).html();
                    }
                });
            }
        }
    });

    kendo.data.binders.widget.blurEditor = kendo.data.Binder.extend({
        refresh: function () {
            var that = this;
            var $element = that.element;

            if ($element.options.name != 'Editor') {
                return;
            }

            var binding = that.bindings.blurEditor;

            var value = binding.source[binding.path];
            if (value) {
                $($element.window).on('blur', value);
            }
        }
    });

    kendo.data.binders.widget.focusEditor = kendo.data.Binder.extend({
        refresh: function () {
            var that = this;
            var $element = that.element;

            if ($element.options.name != 'Editor') {
                return;
            }

            var binding = that.bindings.focusEditor;

            var value = binding.source[binding.path];
            if (value) {
                $($element.window).on('focus', value);
            }
        }
    });

    //toggle function, that allows you to replace the old jquery toggle
    //ex
    //  $('#divSuper').radoloCommon().toggle([
    //      function(){
    //          alert('1');
    //      },
    //      function(){
    //          alert('2');
    //      }
    //  ]);
    $.fn.radoloCommon = function () {
        var that = this;

        return {
            toggle: function (functions) {

                return that.each(function () {
                    var countFunctions = functions.length;
                    $(this).on("click", function (e) {
                        var currentToggle = $(this).data("currentToggle") || 0;

                        $.proxy(functions[currentToggle], $(this))();

                        var newToggle = (currentToggle + 1) % countFunctions;

                        $(this).data("currentToggle", newToggle);
                    });
                });
            }
        };
    };


    var Storage = kendo.Class.extend({
        storageProvider: null,
        storageAvailable: false,
        setItem: function (key, value) {
            try {    
                if (this.storageAvailable) {
                    this.storageProvider.setItem(key, value);
                }
            } catch (e) {
                console.error('radolo Storage.setItem handled');
                console.warn(e);
            }
        },
        getItem: function (key) {
            try {    
                if (this.storageAvailable) {
                    return this.storageProvider.getItem(key);
                }

                return null;
            } catch (e) {
                console.error('radolo Storage.getItem handled');
                console.warn(e);
                return null;
            }
        },
        removeItem: function (key) {
            try {    
                    if (this.storageAvailable) {
                        this.storageProvider.removeItem(key);
                    }
           } catch (e) {
                console.error('radolo Storage.removeItem handled');
                console.warn(e);
            }
        },
        init: function (storageProvider) {
            this.storageProvider = storageProvider;

            try {
                if (storageProvider) {
                    storageProvider.setItem("storageProviderRadoloTest", "XXXX");
                    storageProvider.getItem("storageProviderRadoloTest");
                    storageProvider.removeItem("storageProviderRadoloTest");
                    this.storageAvailable = true;
                }
            } catch (e) {
                console.error('radolo Storage.init handled');
                console.warn(e);
                this.storageAvailable = false;
            }
        }
    });

    $.extend({
        radoloCommon: {
            AUTO_COMPLETE_TIMEOUT:1000, //full second for search delay
            DATE_FORMAT_OUTPUT: "MM/dd/yyyy", //this format is only for us to send info to WCF
            DATE_FORMAT_DISPLAY: "d",
            RADOLO_SITE_VERSION: "Radolo_Site_Version",
            localStorage: new Storage(window.localStorage),
            sessionStorage: new Storage(window.sessionStorage),
            getSiteVersion: function () {  
                var storedVersion = $.radoloCommon.sessionStorage.getItem($.radoloCommon.RADOLO_SITE_VERSION);
                if(storedVersion){
                    //even if we have a stored version, get this and update it in the local storage
                    //we will wrap it in a timeout so there is no chance for it to block the processing ui
                    setTimeout(function(){
                        $.ajax({                    
                            cache: false,
                            async: true,
                            type: "POST",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            url: "/Services/PublicAPI.svc/GetVersion"
                        }).done(function (result) {
                            $.radoloCommon.sessionStorage.setItem($.radoloCommon.RADOLO_SITE_VERSION,result.d);                       
                        });
                    },10); //make this longer than 0, because the next call is a deferred as well

                    return $.Deferred(function(defer){
                        defer.resolve({d:storedVersion});
                    });
                }

                //we did not have it so grab it from the server so we have it for next time
                return $.Deferred(function(defer){
                         $.ajax({                    
                            cache: false,
                            async: true,
                            type: "POST",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            url: "/Services/PublicAPI.svc/GetVersion"
                        }).done(function (result) {
                            $.radoloCommon.sessionStorage.setItem($.radoloCommon.RADOLO_SITE_VERSION,result.d)
                            defer.resolve(result);
                        }).fail(defer.reject);
                    });               
            },
            getSocialSecurityParts: function (SocialSecurityNumber) {
                var ssnParts = {
                    First: "",
                    Second: "",
                    Third: ""
                };

                if (SocialSecurityNumber) {
                    var parts = SocialSecurityNumber.split('-');
                    if (parts.length >= 3) {
                        ssnParts.First = parts[0];
                        ssnParts.Second = parts[1];
                        ssnParts.Third = parts[2];
                        return ssnParts;
                    }
                    if (parts.length == 2) {
                        ssnParts.First = parts[0];
                        ssnParts.Second = parts[1];
                        return ssnParts;
                    }
                    if (parts.length == 1) {
                        ssnParts.First = parts[0];
                        return ssnParts;
                    }
                }

                return ssnParts;
            },
            getFileIcon: function (fileName) {
                if (!fileName) {
                    fileName = "";
                }

                var ext = fileName.split('.').pop();
                switch (ext) {
                    case 'jpg':
                    case 'jpeg':
                        return "jpg";
                    case 'gif':
                        return "gif";
                    case 'tif':
                    case 'tiff':
                        return "tif";
                    case 'bmp':
                        return "bmp";
                    case 'png':
                        return "png";
                    case 'txt':
                        return "txt";
                    case 'rtf':
                        return "rtf";
                    case 'mp4':
                        return "mp4";
                    case 'mov':
                        return "mov";
                    case 'mpg':
                        return "mpg";
                    case 'avi':
                        return "avi";
                    case 'mp3':
                        return "mp3";
                    case 'wav':
                        return "wav";
                    case 'ai':
                        return "ai";
                    case 'eps':
                        return "eps";
                    case 'pages':
                        return "pages";
                    case 'doc':
                        return "doc";
                    case 'docx':
                        return "docx";
                    case 'xls':
                        return "xls";
                    case 'xlsx':
                        return "xlsx";
                    case 'numbers':
                        return "numbers";
                    case 'pdf':
                        return "pdf";
                    case 'zip':
                        return "zip";
                    case 'rar':
                        return "rar";
                    case 'tar':
                        return "tar";
                    case 'sit':
                        return "sit";
                    case 'sitx':
                        return "sitx";
                    default:
                        return "unknown";
                }

            },
            createGUID: function () {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0,
                                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            },
            getFormattedPhone: function (areaCode, number, extension) {
                var result = "";
                if (areaCode) {
                    result = "(" + areaCode + ") ";
                }
                if (number) {
                    result = result + number;
                }
                if (extension) {
                    result = result + " x " + extension;
                }
                return result.trim();
            },
            getCurrentUrlPath: function () {
                var fullUrl = window.location.href;
                var path = window.location.pathname;

                var iPathStart = fullUrl.lastIndexOf(path);

                return fullUrl.substr(iPathStart);
            },
            getRandomNumber: function () {
                // time will always be random cause it always marches forward!!!!
                return Math.random() + '|' + new Date().getTime();
            },
            bindClick: function (element, callback, selector) {
                element.on('click', selector, callback);

                return false;
            },
            stripWhiteSpace: function (text) {
                return (text || "").replace(/[\s]+/gi, '');
            },
            clone: function (obj) {
                console.warn('stop using clone and just use $.extend({},obj) as needed!!!!!');
                return $.extend({}, obj);
            },
            getAbsoluteDifferenceInDays:function(date1,date2){
                date1 = $.radoloCommon.fromWcfDate(date1);
                date2 = $.radoloCommon.fromWcfDate(date2);
                var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                return Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            },
            getRelativeTime: function (time_value) {
                if (typeof (time_value) == 'string' && time_value.indexOf('/Date(') >= 0) {
                    //if we are coming from wcf, then convert
                    time_value = $.radoloCommon.fromWcfDate(time_value);
                }
                var radix = 10;

                var parsed_date = typeof (time_value) == 'string' ? Date.parse(time_value) : time_value;
                var relative_to = (arguments.length > 1) ? arguments[1] : new Date();

                var delta = parseInt((relative_to.getTime() - parsed_date) / 1000, radix);

                if (delta < 60) {
                    return 'less than a minute ago';
                } else if (delta < 120) {
                    return 'about a minute ago';
                } else if (delta < (60 * 60)) {
                    return (parseInt(delta / 60, radix)).toString() + ' minutes ago';
                } else if (delta < (120 * 60)) {
                    return 'about an hour ago';
                } else if (delta < (24 * 60 * 60)) {
                    return 'about ' + (parseInt(delta / 3600, radix)).toString() + ' hours ago';
                } else if (delta < (48 * 60 * 60)) {
                    return '1 day ago';
                } else {
                    return (parseInt(delta / 86400, radix)).toString() + ' days ago';
                }
            },
            formatSeconds: function (millisecondsTotal) {
                var ms = millisecondsTotal % 1000;
                millisecondsTotal = (millisecondsTotal - ms) / 1000;
                var secs = millisecondsTotal % 60;
                millisecondsTotal = (millisecondsTotal - secs) / 60;
                var mins = millisecondsTotal % 60;
                var hrs = (millisecondsTotal - mins) / 60;

                if (hrs) {
                    return kendo.toString(hrs, '00') + ':' + kendo.toString(mins, '00') + ':' + kendo.toString(secs, '00');
                }

                return kendo.toString(mins, '00') + ':' + kendo.toString(secs, '00');
            },
            escapeLiterals: function (text) {
                return $('<div/>').text(text).html().replace(/"/g, "&#34;").replace(/'/g, "&#39;");
            },
            highlightSearch: function (searchTerms, text, className) {
                className = className || "searchTerm";
                if (searchTerms && text) {
                    if (!$.isArray(searchTerms) && !(searchTerms instanceof kendo.Observable)) {
                        searchTerms = [searchTerms];
                    }

                    var pattern = "(" + searchTerms.join('|') + ")";
                    var re = new RegExp(pattern, "gi");
                    text = text.replace(re, '<span class="' + className + '">$1</span>');
                }

                return text;
            },
            createRange: function (startValue, endValue) {
                /// <summary>
                ///     return a numeric array with all the values between the start and end date, inclusive
                ///     you can use low to hi or hi to low
                /// </summary>
                if (typeof startValue !== 'number' || typeof endValue !== 'number') {
                    throw "startValue and endValue must be numbers";
                }

                var values = [];
                var val = 0;
                if (startValue < endValue) {
                    for (val = startValue; val <= endValue; val++) {
                        values.push(val);
                    }
                } else {
                    for (val = startValue; val >= endValue; val--) {
                        values.push(val);
                    }
                }

                return values;
            },
            toYesNo: function (value) {
                if (value === undefined || !value) return 'No';

                return value === 1 || value === true || value.toString().toLowerCase() == 'yes' ? 'Yes' : 'No';
            },
            safeGet: function (itemToTest) {
                //makeu sure it is not undefined, if it is then return it
                if (typeof itemToTest !== 'undefined') {
                    return itemToTest;
                }

                //it was not defined so force it to null
                return null;
            },
            getPreviousDate: function (d) {
                var tmpDate = new Date($.radoloCommon.fromWcfDate(d));
                tmpDate = new Date(tmpDate.setDate(tmpDate.getDate() - 1));
                return tmpDate.toJSON();
            },
            addDaysToCurrent: function (days) {
                var curDate = new Date();

                return $.radoloCommon.addDays(curDate, days);
            },
            addDays: function (startDate, days) {
                var radix = 10;
                days = parseInt(days, radix);

                var newDate = startDate.getDate() + days;

                var tmpDate = startDate.setDate(newDate);

                return new Date(tmpDate);
            },
            resolveUrl: function (url) {
                //baseUrl is at the top of the masterpage, if not go with the blank and log
                //since it is global, we actually need to make sure it is defined
                if (typeof baseUrl === 'undefined' || !$.radoloCommon.safeGet(baseUrl)) {
                    showElapsedTime('No baseURL was provided!');
                    baseUrl = "/";
                }
                if (url.indexOf("~/") === 0) {
                    url = baseUrl + url.substring(2);
                }
                return url;
            },
            getParameterByName: function (name) {
                /// <summary>
                ///     returns the value of a named querystring parameter
                /// </summary>
                /// <param name="name" type="String">
                ///     The name of the parameter to retrieve
                /// </param>
                /// <returns>The value of the parameter or the empty string if it is not found.</returns>
                name = name.toLowerCase();
                var qstring = window.location.search.toLowerCase();

                name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
                var regexS = "[\\?&]" + name + "=([^&#]*)";
                var regex = new RegExp(regexS);
                var results = regex.exec(qstring);
                if (results === null) return "";
                else return decodeURIComponent(results[1].replace(/\+/g, " "));
            },
            setCookie: function (cookieName, cookieValue, nDays) {
                nDays = !$.radoloCommon.safeGet(nDays) ? 0 : nDays;
                var today = new Date();
                var expire = new Date();

                //if fays is 0 then this should be a session cookie
                expire.setTime(today.getTime() + 3600000 * 24 * nDays);

                if (typeof cookieValue !== 'string') {
                    //cookies store a string representation
                    cookieValue = kendo.stringify(cookieValue);
                }

                var sCookie = cookieName + "=" + escape(cookieValue);

                //add the expiration if we have one
                sCookie += nDays > 0 ? ";expires=" + expire.toGMTString() : "";

                document.cookie = sCookie;
            },
            getCookieValue: function (key) {
                currentcookie = document.cookie;
                if (currentcookie.length > 0) {
                    firstidx = currentcookie.indexOf(key + "=");
                    if (firstidx != -1) {
                        firstidx = firstidx + key.length + 1;
                        lastidx = currentcookie.indexOf(";", firstidx);
                        if (lastidx == -1) {
                            lastidx = currentcookie.length;
                        }
                        return unescape(currentcookie.substring(firstidx, lastidx));
                    }
                }
                return null;
            },
            parseSocialNetworkURL: function (snHome, snURL) {
                var index = -1;
                var parsedURL = "";
                switch (snHome) {
                    case 'twitter.com':
                        //Twitter
                    case 'facebook.com':
                        //Facebook

                        if ((index = snURL.search(snHome)) >= 0) {
                            parsedURL = snURL.substr(index);
                        } else {
                            parsedURL = snHome.substring(0, snHome.indexOf('.'));
                        }
                        break;

                    case 'linkedin.com':
                        //LinkedIn

                        if ((index = snURL.search("linkedin.com/in")) >= 0) parsedURL = snURL.substr(index);
                        else if ((index = snURL.search("linkedin.com/pub")) >= 0) parsedURL = snURL.substr(index);
                        else parsedURL = "linkedIn";
                        break;

                    default:
                        parsedURL = "";
                        break;
                }
                return parsedURL;
            },
            fromWcfDate: function (value) {
                if (typeof value != 'string') return value;

                //just try and parse to see if they gave us a date
                var tmp = new Date(value);

                if (tmp != "Invalid Date") return tmp;
                tmp = new Date("1/1/1900 " + value);

                if (tmp != "Invalid Date") return "";

                //it was not a date string so lets try and get the val from the WCF format
                var dateRegExp = /^\/Date\((.*?)\)\/$/;
                var date = dateRegExp.exec(value);
                if (date === null) throw "Date could not be parsed";
                var radix = 10;
                return new Date(parseInt(date[1], radix));
            },
            hideWait: function () {
                $("#radoloLoading").slideUp(200, function () {
                    $(this).remove();
                });
            },
            showWait: function (callback) {
                var wait = $("#radoloLoading");

                if (wait.length > 0) return;

                var container = $('.waitContainer').last(); //always get the inner most wait container
                if (container.length < 1) container = $('body');

                $('<div class="radoloLoading" id="radoloLoading"><span class="image"></span></div>').appendTo(container).slideDown(200, callback);
            },
            getSelection: function (element) {
                console.warn('DEPRECATED:$.radoloCommon.getSelection. use kendo.caret');

                var sel = kendo.caret(element);
                return {
                    Start: sel[0],
                    End: sel[1]
                };
            },
            setCarat: function (element, startOffset, endOffset) {
                console.warn('DEPRECATED:$.radoloCommon.setCaret. use kendo.caret');
                kendo.caret(element,startOffset,endOffset);
            },
            getNiceError: function (errorOBJ) {
                showElapsedTime('dumping error');
                console.warn(errorOBJ);

                if (typeof errorOBJ == 'string') return errorOBJ;

                //make sure something was passed in
                if (!errorOBJ) return null;

                if (errorOBJ.xhr) {
                    errorOBJ = errorOBJ.xhr;
                }


                showElapsedTime('safe get');

                //if we have a message, then return the message
                if (errorOBJ.message) return errorOBJ.message;

                showElapsedTime('no message');
                showElapsedTime(errorOBJ.responseText);

                //if there is not responseText then serialize the object
                if (!errorOBJ.responseText && errorOBJ.status && errorOBJ.statusText) return kendo.toString(errorOBJ.status + ' ' + errorOBJ.statusText);

                showElapsedTime('no response text');

                var error = null;
                try {
                    error = jQuery.parseJSON(errorOBJ.responseText);
                } catch (e) {
                    showElapsedTime('could not parse json');
                    console.warn(e);
                    error = null; //'could not be parsed...';
                }

                if (typeof error == 'string') return error;

                showElapsedTime('no message return response text');
                if (error && error.Message) {
                    return error.Message;
                }

                //we went through everything else so fall back on the response text
                return error || errorOBJ.responseText || kendo.stringify(errorOBJ);
            },
            getRawError: function (errorOBJ) {
                if (!$.radoloCommon.safeGet(errorOBJ)) return null;

                var sRet = $.radoloCommon.safeGet(errorOBJ.responseText);
                if (sRet !== null) return sRet;

                sRet = $.radoloCommon.safeGet(errorOBJ.message);
                if (sRet !== null) return '{Message:"' + sRet + '",Stack:"' + $.radoloCommon.safeGet(errorOBJ.stack) + '"}';

                return kendo.toString(errorOBJ);
            },
            showError: function (err) {
                err = $.radoloCommon.getNiceError(err);
                return $.radoloDialog.showAsWindow({
                    title: 'Oh No!',
                    message: '<p>' + err + '</p>'
                });
            },
            showModalError: function (ex) {
                $.radoloDialog.closeWindow();
                return $.radoloCommon.showError(ex.xhr || ex);
            },
            getPageNumberFromKendoDataSource: function (dataSource, value, field) {
                if (!dataSource) return -1;
                if (!value || value < 1) return -1;

                if (!field) {
                    field = 'ID';
                }

                var pageSize = dataSource.pageSize();
                var data = dataSource.data();

                for (var i = 0; i < data.length; i++) {
                    if (data[i][field] === value) {
                        return Math.floor(i / pageSize) + 1;
                    }
                }

                return -1;
            },
            getCurrentPerson: function () {
                showElapsedTime('getCurrentPerson');

                var publishRefresh = false;

                if ($.radoloCommon._cacheCurrentPerson) {
                    return $.radoloCommon._cacheCurrentPerson;
                }

                //this check is for backwards compatibility until we remove session everywhere
                if (typeof checkCookie !== 'undefined' && checkCookie === true) {
                    var loginCookie = $.radoloCommon.getCookieValue("SessionEstablished");
                    if (!loginCookie) {
                        $.radoloCommon.clearCurrentPerson();
                        return null;
                    }
                }

                //if a current person is logged in, then it will return that person.
                //if no one is logged in, then it will return null
                var currentPerson = $.radoloCommon.sessionStorage.getItem("radolo.CurrentPerson");

                if (!currentPerson) {
                    showElapsedTime('Going to server for Current Person !!!!!!!!! :(');
                    $.ajax({
                        
                        cache: false,
                        async: false,
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        url: "/Services/PublicAPI.svc/GetCurrentPerson"
                    })
                                    .done(function (result) {
                                        showElapsedTime('Current Person server return');
                                        //check to see if we have something
                                        if (!result || !result.d || result.d.ID < 1) {
                                            showElapsedTime('No Data');
                                            $.radoloCommon.clearCurrentPerson();
                                            currentPerson = null;
                                        } else {

                                            $.radoloCommon._cacheCurrentPerson = result.d;
                                            showElapsedTime('got data from current person server');
                                            currentPerson = kendo.stringify(result.d);

                                            $.radoloCommon.sessionStorage.setItem('radolo.CurrentPerson', currentPerson);
                                        }
                                    });
                }

                try {
                    //try and parse the current person that was returned
                    currentPerson = $.parseJSON(currentPerson);

                    //if that person does not have an id
                    //then clear the local storage so the next time we call this it goes to the database
                    if (currentPerson !== null && currentPerson.ID < 1) {
                        $.radoloCommon.clearCurrentPerson();
                    }

                    $.radoloCommon._cacheCurrentPerson = currentPerson;

                    if (publishRefresh) {
                        $.pubsub.publish('refreshCurrentPerson', currentPerson);
                    }

                    //return the person that was parsed
                    return currentPerson;
                } catch (e) {
                    $.radoloCommon.clearCurrentPerson();
                    return null;
                }
            },
            clearCurrentPerson: function (skipCompanyClear) {
                showElapsedTime('clearCurrentPerson');

                $.radoloCommon._cacheCurrentPerson = null;

                $.radoloCommon.sessionStorage.removeItem('radolo.CurrentPerson');
                $.radoloCommon.sessionStorage.removeItem('radolo.UserPreferences');

                //there are occasions when we do not want to clear the company
                if (!skipCompanyClear) {
                    $.radoloCommon.clearCurrentCompany();
                }
            },
            setCurrentCompany: function (companyID, async, force) {
                showElapsedTime('setCurrentCompany');

                var currentCompany = $.radoloCommon.getCurrentCompany();
                if (currentCompany !== null && currentCompany.ID === companyID && !force) {
                    showElapsedTime('We had a current company so just return it');
                    //we do not need to set anything and we can just call the callback with the new id
                    return $.Deferred().resolve({
                        d: currentCompany
                    });
                }

                showElapsedTime('setCurrentCompany--ajax');

                return $.ajax({
                    cache: false,
                    data: kendo.stringify({
                        CompanyID: companyID
                    }),
                    async: async || false,
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    url: "/Application/Services/Secure.svc/SetCurrentCompany",
                    success: function (result) {
                        showElapsedTime('current company success');

                        //this worked so place it into our storage cache
                        currentCompany = result.d;

                        $.radoloCommon._cacheCurrentCompany = currentCompany;

                        $.radoloCommon.sessionStorage.setItem('radolo.CurrentCompany', kendo.stringify(currentCompany));

                        //we want to clear the person so we can refersh the groups permissions based on the newly set company
                        $.radoloCommon.clearCurrentPerson(true);
                    }
                });
            },
            getCurrentCompany: function () {
                showElapsedTime('getCurrentCompany');
                var currentPerson = $.radoloCommon.getCurrentPerson();

                //if there is no current person then there is no current company
                var loggedIn = currentPerson === null || currentPerson.ID > 0;
                if (!loggedIn) {
                    //we are not logged in so clear just in case
                    $.radoloCommon.clearCurrentCompany();
                    return null;
                }

                //this check is for backwards compatibility until we remove session everywhere
                if (typeof checkCookie !== 'undefined' && checkCookie === true) {
                    var loginCookie = $.radoloCommon.getCookieValue("SessionEstablished");
                    if (!loginCookie) {
                        $.radoloCommon.clearCurrentCompany();
                        return null;
                    }
                }

                //check our in memory cache to see if we are set
                if ($.radoloCommon._cacheCurrentCompany) {
                    showElapsedTime('company using cache');
                    return $.radoloCommon._cacheCurrentCompany;
                }
                showElapsedTime('company cache not available');

                //if a current company, then it will return that company.
                //if no company, then it will return null
                var currentCompany = $.radoloCommon.sessionStorage.getItem('radolo.CurrentCompany');

                if (currentCompany) {
                    var tmpCompany = null;
                    showElapsedTime('checking for a last updated company');
                    try {
                        showElapsedTime('checking for a current company');
                        //try and parse the company that was returned
                        tmpCompany = $.parseJSON(currentCompany);
                        showElapsedTime('yup');
                    } catch (e) {
                        showElapsedTime('nope');
                        currentCompany = null;
                    }
                }


                if (!currentCompany) {
                    showElapsedTime('Getting Current Company from server!!!!!!!! :(');
                    $.ajax({
                        
                        cache: false,
                        async: false,
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        url: "/Services/PublicAPI.svc/GetCurrentCompany",
                        success: function (result) {

                            //check to see if we have something
                            if (!result || !result.d || result.d.ID < 1) {
                                $.radoloCommon.clearCurrentCompany();
                                currentCompany = null;
                            } else {
                                $.radoloCommon._cacheCurrentCompany = result.d;

                                currentCompany = kendo.stringify(result.d);

                                $.radoloCommon.sessionStorage.setItem('radolo.CurrentCompany', currentCompany);
                            }
                        }
                    });
                }

                try {
                    showElapsedTime('Current Company Data Parse');
                    //try and parse the company that was returned                    
                    currentCompany = $.parseJSON(currentCompany);
                    showElapsedTime('Current Company Parsed');

                    //if that company does not have an id
                    //then clear the local storage so the next time we call this it goes to the database
                    if (currentCompany !== null && currentCompany.ID < 1) {
                        showElapsedTime('Current Company does not exist');
                        $.radoloCommon.clearCurrentCompany();
                    }

                    $.radoloCommon._cacheCurrentCompany = currentCompany;
                    //return the company  that was parsed
                    return currentCompany;
                } catch (e) {
                    showElapsedTime('Current Company error');
                    console.warn(e);
                    $.radoloCommon.clearCurrentCompany();
                    return null;
                }
            },
            clearCurrentCompany: function () {
                showElapsedTime('clearCurrentCompany');

                $.radoloCommon._cacheCurrentCompany = null;

                $.radoloCommon.sessionStorage.removeItem('radolo.CurrentCompany');

                $.ajax({
                    
                    cache: false,
                    async: false,
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    url: "/Services/PublicAPI.svc/ClearCurrentCompany"
                });
            },
            getUserPreferences: function () {
                var currentPerson = $.radoloCommon.getCurrentPerson();


                if (!currentPerson) {
                    $.radoloCommon.sessionStorage.removeItem('radolo.UserPreferences');

                    return null;
                }

                var userPreferences = $.radoloCommon.sessionStorage.getItem('radolo.UserPreferences');
                if (!userPreferences) {
                    $.ajax({
                        cache: false,
                        async: false,
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        url: "/Application/Services/Secure.svc/GetUserPreferences",
                        success: function (result) {
                            //check to see if we have something
                            if (!result || !result.d) {

                                $.radoloCommon.sessionStorage.removeItem('radolo.UserPreferences');

                                return null;
                            }

                            //loop through the results and parse the values
                            $.each(result.d, function (index, item) {
                                item.Value = $.parseJSON(item.Value);
                            });

                            userPreferences = kendo.stringify(result.d);
                            $.radoloCommon.sessionStorage.setItem('radolo.UserPreferences', userPreferences);
                        }
                    });
                }

                try {
                    //try and parse the user preferences that were returned
                    userPreferences = $.parseJSON(userPreferences);

                    //then clear the local storage so the next time we call this it goes to the database
                    if (!userPreferences) {
                        $.radoloCommon.sessionStorage.removeItem('radolo.UserPreferences');

                        userPreferences = null;
                    }

                    //return the user preferences that were parsed
                    return userPreferences;
                } catch (e) {
                    $.radoloCommon.sessionStorage.removeItem('radolo.UserPreferences');

                    console.warn(e);
                    return null;
                }
            },
            getUserPreference: function (name, userPreferences) {
                showElapsedTime('getUserPreference');

                userPreferences = userPreferences || $.radoloCommon.getUserPreferences();
                if (!userPreferences) return null;

                var existingPreference = null;

                name = name.toLowerCase();

                $.each(userPreferences, function (index, item) {

                    if (item.Name.toLowerCase() === name) {
                        existingPreference = item;
                        //break loop since we found the first item
                        return false;
                    }

                    //we want to keep going so return true
                    return true;
                });

                return existingPreference;
            },
            saveUserPreference: function (userPreference) {
                var currentPerson = $.radoloCommon.getCurrentPerson();
                if (!currentPerson) {
                    return $.Deferred().fail('No Current Person');
                }

                //make sure the userpreference has the appropriate values
                userPreference = $.extend({
                    Name: '',
                    Value: '',
                    PersonID: currentPerson.ID
                }, userPreference);

                //always stringify what gets sent in
                //but get the pristine value to use else where
                var pristineValue = userPreference.Value;
                userPreference.Value = kendo.stringify(userPreference.Value);

                var existingPreference = $.radoloCommon.getUserPreference(userPreference.Name);

                //make sure the value has changed or do not bother making the call
                if (existingPreference && JSON.stringify(existingPreference.Value).toLowerCase() == JSON.stringify(pristineValue).toLowerCase()) {
                    //these have the same name and value so just return the existing preference
                    //this will save us an unneeded network call
                    return $.Deferred().resolve({
                        d: existingPreference
                    });
                }

                var jsonData = kendo.stringify({
                    UserPreference: userPreference
                });

                //return the response from the ajax call
                return $.ajax({
                    cache: false,
                    async: true,
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    url: "/Application/Services/Secure.svc/SaveUserPreference",
                    data: jsonData,
                    success: function (result) {
                        var tmp = result.d;

                        //when we sent the info to the server we stringified it
                        //lets just use the pristine since we have access to it
                        tmp.Value = pristineValue;

                        var userPreferences = $.radoloCommon.getUserPreferences();

                        var returnPref = null;

                        if (existingPreference) {

                            //get a version from the current array, so we can extend it and not have it lost via serialization
                            existingPreference = $.radoloCommon.getUserPreference(userPreference.Name, userPreferences);

                            $.extend(existingPreference, tmp);

                            returnPref = existingPreference;
                        } else {
                            userPreferences.push(tmp);
                            returnPref = tmp;
                        }

                        $.radoloCommon.sessionStorage.setItem('radolo.UserPreferences', kendo.stringify(userPreferences));

                        return $.Deferred().resolve(returnPref);
                    }
                });
            },
            cookiesEnabled: function () {
                var cookieEnabled = (navigator.cookieEnabled) ? true : false;

                if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled) {
                    document.cookie = "testcookie";
                    cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
                }
                return (cookieEnabled);
            },
            removeRoleBasedItems: function () { //get all of the list items that have userRemove assocaited with them
                var body = $('body');

                var currentPerson = $.radoloCommon.getCurrentPerson();

                var itemsToRemove = body.find('[data-permissions]');

                //if we have a current person then tailor the UX, if not it will userRemove them all
                if (currentPerson && currentPerson.WebGroups) {
                    $.each(currentPerson.WebGroups, function (index, item) {
                        var permission = item.toLowerCase();
                        itemsToRemove.filter('[data-permissions~=' + permission + ']').removeAttr('data-permissions');
                    });
                }

                //userRemove all of the UX that are marked for removal
                itemsToRemove.filter('[data-permissions]').remove();
            },
            setCulture: function () {

                $.ajax({
                    cache: true,
                    async: false,
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    url: "/Services/PublicAPI.svc/GetHttpHeaders"
                }).done(function (result) {

                    var headers = result.d;

                    var langString;
                    $.each(headers, function (index, item) {
                        if (item.key == "Accept-Language") {
                            langString = item.value;
                        }
                    });

                    var langArray = langString.split(",");
                    var lang = langArray[0];

                    if (lang.indexOf("-") >= 0) {
                        var country = lang.slice(-2);
                        countryUC = country.toUpperCase();
                        lang = lang.replace(country, countryUC);
                    }

                    $.ajax({
                        cache: true,
                        async: false,
                        dateType: "script",
                        url: "/Kendo/js/cultures/kendo.culture." + lang + ".min.js"
                    }).done(function () {
                        kendo.culture(lang);

                    });

                });
            }
        } //end radoloCommon
    });
})(jQuery);
