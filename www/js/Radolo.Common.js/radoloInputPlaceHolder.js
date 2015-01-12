/// <reference path="radoloCommon.js" />

if (!kendo.support.placeholder || (typeof radoloDebug !== 'undefined' && radoloDebug)) {
    (function ($, undefined) {
        var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        ns = ".radoloInputPlaceHolder",
        NULL = null,
        CHANGE = "change",
        KEYUP = "keyup",
        KEYPRESS = "keypress",
        BLUR = "blur",
        proxy = $.proxy;

        var InputPlaceHolder = Widget.extend({
            init: function (element, options) {
                var that = this;
                that._initializing = true;

                Widget.fn.init.call(that, element, options);

                element = that.element;
                options = that.options;

                options.placeHolderText = element.attr('placeholder');

                //only add this code if they supplied a placeholder
                if (options.placeHolderText && options.placeHolderText.length > 0) {
                    var placeHolderID = element.attr('id');

                    if (!placeHolderID || placeHolderID.length < 1) {
                        //this thing does not have an actual ID so give it a random one
                        var newID = $.radoloCommon.createGUID();

                        //assign the new id to the element
                        element.attr('id', newID);
                        placeHolderID = newID;
                    }

                    options.$placeHolderWrapper = element.wrap('<div class="placeHolderContainer" />')
                                           .before('<label class="placeholderText" for=' + placeHolderID + '>' + options.placeHolderText + '</label>')
                                           .removeAttr('placeholder').parent();


                    //just in case the child had a class push it up to the parent
                    options.$placeHolderWrapper.addClass(element.attr('class'));

                    options.$placeHolder = options.$placeHolderWrapper.find('.placeholderText');
                } else {
                    options.$placeHolder = $('<span style="display:none;"></span');
                }

                element
                    .on(BLUR + ns, proxy(that._blur, that))
                    .on(CHANGE + ns, proxy(that._change, that))
                    .on(KEYUP + ns, proxy(that._keyup, that))
                    .on(KEYPRESS + ns, proxy(that._keypress, that));

                that.value(element.val());

                //notify that... i have no idea what this does...thanks for the documentation kendo :(
                kendo.notify(that);
                that._initializing = false;
            },
            options: {
                name: "InputPlaceHolder",
                supressEnterKey: false,
                valueUpdate: 'change'
            },
            value: function (value) {
                var that = this;

                if (value === undefined) {
                    return that._value;
                }

                that._update(value);
                that._old = that._value;
            },
            _blur: function (e) {
                var that = this,
                element = that.element,
                value = element.val();

                if (that._old != value) {
                    that._update(value);

                    value = that._value;
                    that._old = value;

                    //always send the blur through
                    that.trigger(BLUR, e);

                    // trigger the DOM change event so any subscriber gets notified
                    that.element.trigger(BLUR, e);

                    //we actually changed
                    that.trigger(CHANGE, e);

                    // trigger the DOM change event so any subscriber gets notified
                    that.element.trigger(CHANGE, e);
                }
            },
            _keypress: function (e) {
                var 
                    that = this,
                    options = that.options,
                    supressEnterKey = options.supressEnterKey;

                //we do not want the enter key going up the stack
                // data-supress-enter-key='true' 
                if (supressEnterKey && e.keyCode == 13) {
                    e.preventDefault();
                    that._change(e);
                    return;
                }

                //send the keypress through
                that.trigger(KEYPRESS, e);
            },
            _keyup: function (e) {
                var that = this,
                element = that.element,
                value = element.val();

                var options = that.options,
                    placeHolderText = options.placeHolderText,
                    $placeHolder = options.$placeHolder;

                if (value !== placeHolderText) {
                    $placeHolder.hide();
                }
                if (value == '' || !value) {
                    $placeHolder.show();
                }

                if (that.options.valueUpdate == 'keyup') {
                    

                    //always send the keyup through
                    that.trigger(KEYUP, e);

                    //we want change to fire after keyup
                    that._change(e);
                } else {

                    that._update(value);

                    //always send the keyup through
                    that.trigger(KEYUP, e);
                }
            },
            _change: function (e) {
                var that = this,
                element = that.element,
                value = element.val();

                that._update(value);
                value = that._value;

                if (that._old != value) {

                    that._old = value;

                    that.trigger(CHANGE, e);

                    // trigger the DOM change event so any subscriber gets notified
                    that.element.trigger(CHANGE, e);
                }
            },
            _update: function (value) {
                var that = this,
                element = that.element;

                if (that._value == value) { return false; }

                //get the start and end of the selection,before we update the value
                var selection = $.radoloCommon.getSelection(that.element[0]);

                that._value = value
                that.element.val(value);

                //replace our selection
                if (!that._initializing) {
                    kendo.caret(that.element[0], selection.Start, selection.End)
                }

                var options = that.options,
                    placeHolderText = options.placeHolderText,
                    $placeHolder = options.$placeHolder;

                if (value !== placeHolderText) {
                    $placeHolder.hide();
                }
                if (value == '' || !value) {
                    $placeHolder.show();
                }

                return true;
            }
        });

        ui.plugin(InputPlaceHolder);
    })(jQuery);
}