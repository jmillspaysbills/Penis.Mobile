/// <reference path="radoloCommon.js" />

/*
radoloUniform v1.0.0
Copyright © 2013 Joshua Grippo / Radolo
http://radolo.com
executes a jquery.uniform on the element if the data-role='uniform'
ex. 1: <input type='checkbox' data-role='uniform' data-binding='value:checkValue,events:{change:checkChanged}' data-change-click-only='true'/>
ex. 2: 
        <input data-role='uniform' type='radio' value='Red' data-group-name='Colors' data-bind='value:objectColorValue'/>
        <input data-role='uniform' type='radio' value='Blue' data-group-name='Colors' data-bind='value:objectColorValue'/>
*/
(function () {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        support = kendo.support,
        ns = ".radoloUniform",
        CHANGE = 'change',
        CLICK = 'click';

    kendo.data.binders.widget.uniformName = kendo.data.Binder.extend({
        refresh: function () {
            var $element = $(this.element);


            var value = this.bindings["uniformName"].get();

            $element.attr('name', value);
        }
    });

    var Uniform = Widget.extend({
        init: function (element, options) {

            if (!$(element).is('input')) {
                console.warn("data-role=uniform can only be used on input elements");
                console.warn(element);
                throw "data-role=uniform can only be used on input elements";
            }

            var that = this;

            that._initializing = true;

            kendo.ui.Widget.fn.init.call(that, element, options);

            element = that.element;
            options = that.options;

            var inputType = element.attr('type');
            if (!inputType) {
                element.attr('type', 'checkbox');
                inputType = 'checkbox';
            }

            that._IsCheckBox = inputType == 'checkbox';
            that._value = element.val();

            //lets convert to a proper true/false for radio buttons.
            if (that._value == 'false') { that._value = false; }
            if (that._value == 'true') { that._value = true; }

            if (options.groupName) {
                element.attr('name', options.groupName);
            }

            //we need to set our default
            if (that._IsCheckBox) {
                that._old = element.is(':checked')
            } else {
                //we need to set our default
                that._old = that._value;
            }

            //keep a reference to our uniform element
            that.uniform = element.uniform();

            //notify that... i have no idea what this does...thanks for the documentation kendo :(
            kendo.notify(that);
            that._initializing = false;


            element.on(CLICK + ns, function (e) {
                that.trigger(CLICK, e);
            }).on(CHANGE + ns, $.proxy(that._change, that));

        },
        _change: function (e) {
            var that = this;

            if (that._IsCheckBox) {
                that.value(that.element.is(':checked'), true);
            } else {
                that.value(that._value, true);
            }
        },
        checked: function () {
            var that = this;
            return that.element[0].checked;
        },
        value: function (value, fromClick) {
            var that = this;


            //lets convert to a proper true/false for radio buttons.
            if (value == 'false') { value = false; }
            if (value == 'true') { value = true; }

            var changed = that._old != value;
            var trigger = false;

            //check and see if we should be firing only from clicks
            if (that.options.changeClickOnly) {
                //we should only fire from a click so make sure it came from a click
                if (fromClick) {
                    //it came from a click so follow normal rules for trigger
                    trigger = changed;
                }
            } else {
                //we do not care where this came from so just fire if the value is changing
                trigger = changed;
            }

            if (value == undefined) {
                if (that._IsCheckBox) {
                    return that.element.is(':checked');
                } else {
                    //not a bool so return whatever it is
                    return that._value;
                }
            } else {
                if (that._IsCheckBox) {
                    that.element[0].checked = value;
                } else {
                    //radio buttons have their own logic
                    if (that._value == value) {
                        that.element[0].checked = true;

                        //we should only trigger if we are changeClickOnly and we are from a click or we are not changeClickOnly
                        trigger = (that.options.changeClickOnly && fromClick) || !that.options.changeClickOnly;

                        //we know it matched so set our value to true, which will cause the uniform to check below
                        //this is mainly for the case where the values of the uniform are true/false
                        value = true;

                        changed = true;
                    } else {
                        //for radios we should not trigger unless we are changing to our specific value
                        changed = false;
                        trigger = false;
                    }
                }
            }

            //we changed so update our values
            if (changed) {
                that._old = value;

                //we need to update the underlying checkbox to the new value
                that.uniform[0].checked = value;

                //update the uniform value so it makes the change on the screen
                $.uniform.update(that.uniform);
            }

            //if we changed and we are supposed to trigger
            if (trigger && changed) {
                //let the world know we have changed
                that.trigger(CHANGE);
            }
        },
        enable: function (enabled) {
            //checked widgets have an enable binding that will get called if the binding changes

            var that = this;

            //update our attribute
            that.element.attr('disabled', !enabled);


            //update the uniform value so it makes the change on the screen
            $.uniform.update(that.uniform);

        },
        //I know I need to register events, but what events and why is not documented anywhere
        //maybe kendo can get us some documentation on how this is working
        events: [CHANGE, CLICK],
        options: {
            name: "Uniform", //name of my plug in
            groupName: "", //if we have a radio group we need this
            changeClickOnly: false // if this is true, we will only fire change events that originate from a click of the checkbox. manipulating the value will not cause a change
        }
    });

    ui.plugin(Uniform);

})(jQuery);