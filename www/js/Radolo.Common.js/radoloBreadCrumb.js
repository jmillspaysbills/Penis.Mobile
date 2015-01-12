/// <reference path="radoloCommon.js" />

/*
radolo BreadCrumb v1.0.0
Copyright © 2013 Joshua Grippo / Radolo
http://radolo.com

tracks recently visited pages and allows users to navigate between them
ex. 1: <div data-role='breadcrumb'/>

remarks: there is a dependency of radoloRouter, radoloCommon, kendo, pubsub
*/
(function () {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        support = kendo.support,
        ns = ".radoloBreadCrumb",
        PAGES_VISITED = "pagesVisited",
        PAGE_LOADED = "pageloaded",
        TEMPLATE_LOADED = "breadCrumbTemplateLoaded",
        TEMPLATE_PATH = "/templates/templatebreadcrumb.template.html";

    var BreadCrumb = Widget.extend({
        init: function (element, options) {

            if (!$(element).is('div')) {
                console.warn("data-role=breadcrumb can only be used on div elements");
                console.warn(element);
                throw "data-role=breadcrumb can only be used on div elements";
            }

            var that = this;
            that._initializing = true;

            kendo.ui.Widget.fn.init.call(that, element, options);

            element = that.element;
            options = that.options;

            //this is where we are going to get the user preferences for this control, then load recent pages visited
            that.recentPages = $.radoloCommon.getUserPreference(PAGES_VISITED);

            if (that.recentPages) {
                that.recentPages = that.recentPages.Value;
                that.showPages();
            } else {
                that.recentPages = [];
            }

            $.pubsub.subscribe(PAGE_LOADED, function (e) {
                if (e && e.Name && e.URL) {
                    //we have arguments a name and a URL
                    //check and see if this url exists already, if it is not last, then remove it from where it is
                    //then make it last
                    //show our pages
                    //then save the user preferences

                    //we should add something to get rid of dupes

                    var arr = $.grep(that.recentPages, function (item, index) {
                        return item.URL.toLowerCase() !== e.URL.toLowerCase();
                    });

                    //this is everything without the current page, so push the page onto the end
                    arr.push(e);

                    //we need to get rid of anything that would make us larger than 10
                    var spliceIndex = arr.length - 5;
                    if (spliceIndex > 0) {
                        arr = arr.splice(spliceIndex);
                    }

                    that.recentPages = arr;
                    that.showPages();

                    $.radoloCommon.saveUserPreference({ Name: PAGES_VISITED, Value: arr });
                }
            });

            //notify that... i have no idea what this does...thanks for the documentation kendo :(
            kendo.notify(that);
            that._initializing = false;
        },
        showPages: function () {
            var that = this;

            //check and see if we have our template
            if (!that.template) {
                //we do not have a template so subscribe and then show the pages when we have it
                $.pubsub.subscribe($.radoloTemplateLoader.TEMPLATE_LOADED, function (path, template, that) {
                    //we want to get out if we do not have the correct path
                    //there were cases where that was undefined, not sure why it was happening
                    if (path != TEMPLATE_PATH || !that) { return; }

                    var sTemplate = template;
                    var $template = $(sTemplate);

                    that.template = kendo.template($template.html());
                    that.showPages();
                });

                $.radoloTemplateLoader.load(TEMPLATE_PATH, that);
                return;
            }

            that.element.children().remove();

            var count = that.recentPages.length;

            $.each(that.recentPages, function (index, item) {

                var link = that.template(item);

                that.element.append(link);

                if (index < count - 1) {
                    that.element.append('<span class="breadCrumbSpacer"></span>');
                }
            });

            //bind all of the links to the radoloRouter;
            that.element.find('a').click($.radoloRouter.clickLink);
        },
        //I know I need to register events, but what events and why is not documented anywhere
        //maybe kendo can get us some documentation on how this is working
        events: [],
        options: {
            name: "BreadCrumb" //name of my plugin
        }
    });

    ui.plugin(BreadCrumb);

})(jQuery);