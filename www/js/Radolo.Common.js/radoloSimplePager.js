/// <reference path="radoloCommon.js" />

/*
radoloSimplePager v1.0.0
Copyright © 2013 Joshua Grippo / Radolo
http://radolo.com
Turns a div into a pager that is bound against a particular datasource
ex. 1: <div data-role='simplePager' data-binding='source:dsP' />
*/
(function () {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        support = kendo.support,
        ns = ".radoloSimplePager";

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change";


    var SimplePager = Widget.extend({
        options: {
            name: "SimplePager", //name of my plug in            
            autoBind: false,
            pageSizes: '5,10,20'
        },
        // events are used by other widgets / developers - API for other purposes
        // these events support MVVM bound items in the template. for loose coupling with MVVM.
        events: [
        // call before mutating DOM.
        // mvvm will traverse DOM, unbind any bound elements or widgets
            DATABINDING,
        // call after mutating DOM
        // traverses DOM and binds ALL THE THINGS
            DATABOUND
        ],
        init: function (element, options) {
            var that = this;

            that._initializing = true;

            kendo.ui.Widget.fn.init.call(that, element, options);

            element = that.element;
            options = that.options;

            //make sure the pager is empty
            element.addClass('r-pager-container');
            element.empty();

            that._dataSource();

            //notify that... i have no idea what this does...thanks for the documentation kendo :(
            kendo.notify(that);
            that._initializing = false;
        },
        // for supporting changing o the datasource via MVVM
        setDataSource: function (dataSource) {

            this.options.dataSource = dataSource;

            this._dataSource();

        },
        _dataSource: function () {

            var that = this;

            // returns the datasource OR creates one if using array or configuration object
            that.dataSource = kendo.data.DataSource.create(that.options.dataSource);

            if (that.dataSource && that._refreshHandler) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);
            }
            else {
                that._refreshHandler = $.proxy(that.refresh, that);
            }

            // bind to the change event to refresh the widget
            that.dataSource.bind(CHANGE, that._refreshHandler);

            if (that.options.autoBind) {
                that.dataSource.fetch();
            }
        },
        // mvvm expects an array of dom elements that represent each item of the datasource.
        // should be the outermost element
        //this is what binds the children
        items: function () {
            return []; //we do not need to bind anything right now
        },
        refresh: function (e) {

            if (e && e.action == "itemchange") {
                return;
            }

            var that = this;

            that.trigger(DATABINDING);

            that.element.empty();

            //we have data so lets add everything
            var $buttonContainer = $('<div class="r-button-container"></div>');
            var $pageSelectorContainer = $('<div class="r-page-size-container"></div>');

            //we need to go through and add all of our html elements
            if (that.hasData() && !that.hidePager()) {
                var $left = $('<div class="r-left-button-container half fl"><button class="button small wide"><i class="icon-r-circleleft"></i>&nbsp;Previous</button></div>');
                var $right = $('<div class="r-right-button-container half fr"><button class="button small wide">Next&nbsp;<i class="icon-r-circleright"></i></button></div>');

                $left.find('button').bind('click', $.proxy(that.moveToPreviousPage, that)).prop('disabled', that.isPreviousButtonDisabled());
                $right.find('button').bind('click', $.proxy(that.moveToNextPage, that)).prop('disabled', that.isNextButtonDisabled());

                $buttonContainer.append($left).append($right);

                var htmlSelect = '<select>';
                var pagesizes = that.options.pageSizes.split(',');
                var selected = that.getPageSize();
                for (var i = 0; i < pagesizes.length; i++) {
                    var pageSize = pagesizes[i];

                    htmlSelect = htmlSelect + '<option value="' + pageSize + '" ' + (pageSize == selected ? "selected" : "") + '>' + pageSize + ' items per page</option>';
                }
                htmlSelect += '</select>';

                $(htmlSelect).appendTo($pageSelectorContainer).bind('change', $.proxy(that.onChangePageSizeRecents, that));
            } else {
                $buttonContainer.hide();
                $pageSelectorContainer.hide();
            }

            that.element.append($buttonContainer);
            that.element.append($pageSelectorContainer);

            that.trigger(DATABOUND);
        },
        hasData: function () {
            return this.dataSource.data().length > 0;
        },
        getCurrentPageNumber: function () {
            return this.dataSource.page();
        },
        moveToPreviousPage: function () {
            this.dataSource.page(this.getCurrentPageNumber() - 1);
        },
        moveToNextPage: function () {
            this.dataSource.page(this.getCurrentPageNumber() + 1);
        },
        isNextButtonDisabled: function () {
            return (this.dataSource.page() === this.dataSource.totalPages());
        },
        isPreviousButtonDisabled: function () {
            return (this.dataSource.page() === 1);
        },
        hidePager: function () {
            return (this.dataSource.totalPages() <= 1);
        },
        getPageSize: function () {
            return this.dataSource.pageSize();
        },
        onChangePageSizeRecents: function () {
            var newSize = this.element.find('select').val();
            newSize = parseInt(newSize, 10);
            this.dataSource.pageSize(newSize);
        }
    });

    ui.plugin(SimplePager);

})(jQuery);