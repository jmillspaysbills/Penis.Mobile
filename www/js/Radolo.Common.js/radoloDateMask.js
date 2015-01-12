(function ($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        ns = ".radoloDateMask",
        NULL = null,
        CHANGE = "change",
        KEYPRESS = "keypress",
        proxy = $.proxy;

    var DateMask = Widget.extend({
        //I know I need to register events, but what events and why is not documented anywhere
        //maybe kendo can get us some documentation on how this is working
        events: [CHANGE],
        options: {
            name: "DateMask"
        },
        init: function (element, options) {
            var that = this;
            that._initializing = true;

            Widget.fn.init.call(that, element, options);

            element = that.element;
            options = that.options;

            element.on(CHANGE + ns, proxy(that._change, that))
                .on(KEYPRESS + ns, proxy(that._keypress, that))
                .insertBefore(element);

            //set any default that may have been added manually to the input box
            //do not raise the change event since this value is only used if we are using mvvm
            that.value(element.val());

            //notify that... i have no idea what this does...thanks for the documentation kendo :(
            kendo.notify(that);
            that._initializing = false;
        },
        value: function (value) {
            var that = this;

            if (value === undefined) {
                //we need to return our current value                
                var val = that.element.val();

                //we will return an empty string if the value is not a valid date
                if (that.isValidDate(val)) {
                    return val;
                } else {
                    return "";
                }
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
        isValidDate: function (val) {
            var arrParts = val.split("/");
            if (arrParts.length !== 3) {
                return false;
            }

            var d = new Date(val);
            if (Object.prototype.toString.call(d) !== "[object Date]") {
                return false;
            }

            return !isNaN(d.getTime());
        },
        _keypress: function (e) {
            //we will not do anything unless the is a number or a /            
            switch (true) {
                case ((e.keyCode < 48 || e.keyCode > 57) && e.keyCode != 47):
                    e.preventDefault();
                    return false;
                case (e.keyCode === 47):
                    //they are trying to enter a /
                    //make sure they do not already have 2 and that they are not consecutive

                    break;
            }

            //the keypress happened so lets modify what we need to
            var that = this;

            setTimeout(function () {
                var val = that.element.val();
                var arrParts = val.split("/");

                var newValue = "";

                switch (arrParts.length) {
                    //handle the month portion 
                    case (1):

                        //we do not have a slash yet so check to see if we need to add one
                        var m = parseInt(arrParts[0]);

                        if (m < 1) {
                            //they just added a 0
                            newValue = val;
                            return;
                        }
                        if (m !== 1 || arrParts[0].length > 1) {
                            if (m <= 12) {
                                //a slash needs to go after m
                                newValue = m + "/";

                            } else {
                                //a slash needs to go after the 1
                                newValue = [val.slice(0, 1), '/', val.slice(1)].join('').slice(0, 8);
                            }
                        } else {
                            newValue = val;
                        }

                        break;

                    case (2):
                        if (parseInt(arrParts[0]) < 1) {
                            newValue = "0";
                        } else if (arrParts[1].length >= 2) {
                            newValue = arrParts[0] + '/' + arrParts[1].slice(0, 2) + '/';
                        } else {
                            newValue = val;
                        }
                        break;
                    case (3):
                        var ms = arrParts[0].slice(0, 2);
                        var ds = arrParts[1].slice(0, 2);
                        var ys = arrParts[2].slice(0, 4);

                        newValue = ms + '/' + ds + '/' + ys;

                        break;
                    default:
                        newValue = "";
                        break;
                }

                that.element.val(newValue);

                if (that.isValidDate(newValue)) {
                    console.warn('good');
                    that.element.removeClass("invalid");
                } else {
                    console.warn('invalid');
                    that.element.addClass("invalid");
                }
            }, 0);
        }
    });

    ui.plugin(DateMask);
})(jQuery);