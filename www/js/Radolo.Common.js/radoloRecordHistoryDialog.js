/// <reference path="radoloCommon.js" />

/*
radoloUniform v1.0.0
Copyright © 2013 Joshua Grippo / Radolo
http://radolo.com

turns a button into a record history dialog
ex. 1:            <button data-role='recordhistorydialog' data-entity='CompanyMergeTemplates' data-bind='value:mergeTemplate.ID'>
                        View Record History
                  </button>

remarks: there is a dependency of http://uniformjs.com/
*/
(function () {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        support = kendo.support,
        ns = ".radoloRecordHistoryDialog";

    var RecordHistoryDialog = Widget.extend({
        init: function (element, options) {

            if (!$(element).is('button')) {
                console.warn("data-role=recordhistorydialog can only be used on button elements");
                console.warn(element);
                throw "data-role=recordhistorydialog can only be used on button elements";
            }

            if (!options.entity) {
                console.warn("data-role=recordhistorydialog requires an entity options");
                console.warn(options);
                throw "data-role=recordhistorydialog requires an entity options";
            }

            var that = this;

            that._initializing = true;

            that.value = that._value;

            kendo.ui.Widget.fn.init.call(that, element, options);

            element = that.element;
            options = that.options;

            //notify that... i have no idea what this does...thanks for the documentation kendo :(
            kendo.notify(that);

            that._initializing = false;
        },
        _value: function (value) {
            var that = this;

            var element = that.element;

            element.unbind('click').bind('click', function (e) {
                e.preventDefault();

                $.pubsub.subscribeSingle('recordHistoryNeedsData', function () {
                    $.pubsub.publish('recordHistoryDataReady', [that.options.entity, value]);
                });

                $.radoloDialog.showUrlWindow({
                    width: that.options.width,
                    height: that.options.height,
                    title: that.options.title,
                    url: '/Application/RecordHistory.aspx'
                });
            });
        },
        options: {
            name: "RecordHistoryDialog", //name of my plug in
            entity: "",
            title: "Record History",
            height: '500',
            width: '700'
        }
    });

    ui.plugin(RecordHistoryDialog);

})(jQuery);