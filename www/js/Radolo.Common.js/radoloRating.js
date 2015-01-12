/// <reference path="radoloCommon.js" />

/*
radoloRating v1.0.0
Copyright © 2013 Joshua Grippo / Radolo
http://radolo.com
This is Joel Flachsbart's first attempt at a plugin.
ex. 1: <div data-role='rating' data-bind='value:ratingValue' />

Set the number of rating values (Defaults to 10)
ex. 2: <div data-role='rating' data-stars='5' data-bind='value:ratingValue' />

Set read-only status
ex. 3: <div data-role='rating' data-stars='5' data-readonly="true" data-bind='value:ratingValue' />

*/
(function () {

    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        support = kendo.support,
        ns = ".radoloRating";

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        CLICK = 'click';


    var Rating = Widget.extend({
        options: {
            name: "Rating", //name of my plug in            
            stars: 10, //The number of stars the widget will build 
            readonly: false //Set this to true if you want a readonly rating
        },
        // events are used by other widgets / developers - API for other purposes
        // these events support MVVM bound items in the template. for loose coupling with MVVM.
        events: [
        CLICK
        ],
        init: function (element, options) {
            var that = this;

            that._initializing = true;

            Widget.fn.init.call(that, element, options);

            element = that.element;
            options = that.options;

            //This is dumb because if the style sheet changes it will break :( 
            element.addClass('rating');

            //add the readOnly class to disable the stars when hovering
            if (options.readonly) { element.addClass('readOnly') };


            //notify that... i have no idea what this does...thanks for the documentation kendo :(
            kendo.notify(that);
            that._initializing = false;

        },
        value: function (value) {
            var that = this;

            //If the function is called without a parameter, just return the current value.
            if (value == undefined) {
                return that._value;
            }

            //Make the the div is empty 
            that.element.empty();

            var $rating;

            var $stars;
            //get the number of stars specified in the options
            starNum = that.options.stars;

            //loop through and build a span for each star
            for (var i = 0; i < starNum; i++) {

                $item = $('<span class="star" data-rating="' + (starNum - i) + '">' + (starNum - i) + '</span>');

                //Don't bind clicks if it is readonly
                if (!that.options.readonly) {
                    $item.bind('click', $.proxy(that.updateRating, that));
                }
                //The star with the current value gets the class full. Again, this sucks because it depends on the class names staying the same.
                if (value == (starNum - i)) {
                    $item.addClass('full');
                }

                that.element.append($item);

            }

            return value;

        },
        updateRating: function (e) {

            var that = this;

            that._value = that.value(parseInt(e.currentTarget.innerHTML));

            that.trigger(CLICK, that);

            that.trigger("change", { field: "value" });
        }

    });

    ui.plugin(Rating);

})(jQuery);