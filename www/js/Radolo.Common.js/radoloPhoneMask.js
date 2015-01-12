kendo.data.binders.widget.areaCode = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //call the base constructor
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        var that = this;

        //listen for the change event of the element, then push it to the view model
        $(this.element.areaCode).on("change", function () {
            that.change(); //call the change function
        });
    },
    refresh: function () {
        //get the element that we are bound to, then update its value from the binding
        var $element = $(this.element.areaCode);

        var value = this.bindings["areaCode"].get();
        $element.val(value);
    },
    change: function (e) {
        //the change event gets the value from the html element and pushes it to the view model
        var value = $(this.element.areaCode).val();
        this.bindings["areaCode"].set(value); //update the View-Model        
    }
});

kendo.data.binders.widget.phone = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //call the base constructor
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        var that = this;

        //listen for the change event of the element, then push it to the view model
        $(this.element.phone).on("change", function () {
            that.change(); //call the change function
        });
    },
    refresh: function () {
        //get the element that we are bound to, then update its value from the binding
        var $element = $(this.element.phone);

        var value = this.bindings["phone"].get();
        $element.val(value);
    },
    change: function (e) {
        //the change event gets the value from the html element and pushes it to the view model
        var value = $(this.element.phone).val();
        this.bindings["phone"].set(value); //update the View-Model        
    }
});

kendo.data.binders.widget.ext = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //call the base constructor
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        var that = this;

        //listen for the change event of the element, then push it to the view model
        $(this.element.ext).on("change", function () {
            that.change(); //call the change function
        });
    },
    refresh: function () {
        //get the element that we are bound to, then update its value from the binding
        var $element = $(this.element.ext);

        var value = this.bindings["ext"].get();
        $element.val(value);
    },
    change: function (e) {
        //the change event gets the value from the html element and pushes it to the view model
        var value = $(this.element.ext).val();
        this.bindings["ext"].set(value); //update the View-Model        
    }
});

(function ($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        ns = ".radoloPhoneMask",
        NULL = null,
        CHANGE = "change",
        KEYPRESS = "keypress",
        proxy = $.proxy;

    var PhoneMask = Widget.extend({
        //I know I need to register events, but what events and why is not documented anywhere
        //maybe kendo can get us some documentation on how this is working
        events: [CHANGE],
        options: {
            name: "PhoneMask",
            areaClass: "radoloInput small areaCode",
            phoneClass: "radoloInput small phoneNumber",
            extClass: "radoloInput small extension",
            areaPlaceHolder: "Area",
            phonePlaceHolder: "Number",
            extPlaceHolder: "Ext"
        },
        init: function (element, options) {
            var that = this;
            that._initializing = true;

            Widget.fn.init.call(that, element, options);

            element = that.element;
            options = that.options;

            element.hide();

            that.areaCode = $('<input maxlength="3"/>')
                .attr('class', options.areaClass)
                .attr('placeholder', options.areaPlaceHolder)
                .on(CHANGE + ns, proxy(that._change, that))
                .on(KEYPRESS + ns, proxy(that._keypressAreaCode, that))
                .insertBefore(element);

            that.phone = $('<input maxlength="8"/>')
                .attr('class', options.phoneClass)
                .attr('placeholder', options.phonePlaceHolder)
                .on(CHANGE + ns, proxy(that._change, that))
                .on(KEYPRESS + ns, proxy(that._keypressPhone, that))
                .insertBefore(element);

            that.ext = $('<input/>')
                .attr('class', options.extClass)
                .attr('placeholder', options.extPlaceHolder)
                .on(CHANGE + ns, proxy(that._change, that))
                .on(KEYPRESS + ns, proxy(that._keypressExt, that))
                .insertBefore(element);

            that.value(element.val());

            //notify that... i have no idea what this does...thanks for the documentation kendo :(
            kendo.notify(that);
            that._initializing = false;
        },
        value: function (value) {
            var that = this;

            if (value === undefined) {
                //we need to return our current value                
                return that.element.val();
            }

            //if we made it to here then we are trying to set a value
            //check to see if it has changed
            if (that.element.val() !== value) {
                //it has so lets update the element 
                that.element.val(value);
            }
        },
        _change: function (e) {
            //the change event has fired so let the world know
            var that = this;
            that.trigger(CHANGE, e);
        },
        _keypressAreaCode: function (e) {
            var that = this;
            var areaCode = that.areaCode;
            setTimeout(function () {
                if (areaCode.val().length >= 3) {
                    that.phone.focus();
                }
            }, 0);
        },
        _keypressExt:function(e){
            //the keypress happened so lets modify what we need to
            var that = this;

            setTimeout(function(){
                that.trigger(KEYPRESS, e);
            },0);
        },
        _keypressPhone: function (e) {
            //the keypress happened so lets modify what we need to
            var that = this;
            var phone = that.phone;

            if (e.keyCode === 13) {
                //they hit enter so lets just let it go
                that.trigger(KEYPRESS, e);
                return;
            }

            var val = phone.val();

            var sel = kendo.caret($(e.target));
            if (sel[0] - sel[1] === 0 && val.length >= 8) {
                //nothing more than 8 no matter what
                return false;
            }

            //timeout so the key stroke has a chance to finish
            setTimeout(function () {
                var val = phone.val();

                //remove the '-'
                val = val.replace(/\-/g, '');

                //check to see if we need to start doing the -calculation
                if (val.length > 2) {
                    //add it back in the 4th place
                    val = [val.slice(0, 3), '-', val.slice(3)].join('').slice(0, 8);
                    phone.val(val);
                }
                console.warn(val);
                console.warn(val.length);
                if (val.length >= 8) {
                    that.ext.focus();
                }

                that.trigger(KEYPRESS, e);
            }, 0);
        }
    });

    ui.plugin(PhoneMask);
})(jQuery);