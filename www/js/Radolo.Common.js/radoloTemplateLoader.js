/// <reference path="radoloCommon.js" />

$.extend({
    //Loads external templates from path and injects in to page DOM
    radoloTemplateLoader: {
        TEMPLATE_FAILED: "TEMPLATE_FAILED",
        TEMPLATE_LOADED: "TEMPLATE_LOADED",
        TEMPLATE_LOADED_ALL: "TEMPLATE_LOADED_ALL",
        // the path/template hash
        cache: {},
        //Method: loadExtTemplate
        //Params: (string) path: the relative path to a file that contains template definition(s)
        load: function (path, args) {
            console.warn('start template ' + new Date().getTime());
            if (typeof path === 'undefined' || path === null || path.length === 0) {
                //no path was supplied so
                throw "No Path supplied for load";
            }

            var publishSuccess = function (path, args) {
                //Publish an event that indicates when a template is done loading                
                $.pubsub.publish(path, args);

                //get a copy of the array
                var argsWithPath = args.slice(0);

                //then add the path to the beginning
                argsWithPath.splice(0, 0, path);

                $.pubsub.publish($.radoloTemplateLoader.TEMPLATE_LOADED, argsWithPath);
            };

            path = (path || "").toLowerCase(); //make sure we are lowercase, just so we don't have to worry about sloppy codeing :(
            args = args || [];
            //make sure we are deailing with an array
            if (!$.isArray(args)) { args = [args]; }

            //check to see if we have already loaded this and if we have just publish
            if (this.cache[path]) {
                console.warn('cache');
                args.splice(0, 0, this.cache[path]);

                publishSuccess(path, args);

                console.warn('cached template ' + new Date().getTime());
                return null; //get out
            }

            var self = this;

            //Use jQuery Ajax to fetch the template file
            $.get(path).success(function (result) {
                //this was successfull so cache it, this way we will not make multiple trips
                if (!self.cache[path]) {
                    self.cache[path] = result;
                }

                console.warn('caching ' + new Date().getTime());

                //this was successfull so add the result text to our args
                args.splice(0, 0, result);
                console.warn('splicing ' + new Date().getTime());
            }).error(function (result) {
                console.warn('error ' + new Date().getTime());

                //we had a failure, so add the result so we can inspect it if need be
                args.splice(0, 0, result);

                //we need to put our exceptionlogging and window display in here...                
                $.pubsub.publish($.radoloTemplateLoader.TEMPLATE_FAILED, args);
            }).complete(function (result) {
                console.warn('complete ' + new Date().getTime());

                publishSuccess(path, args);
            });
        },
        loadAll: function (paths, args) {
            if (!paths) {
                console.warn("paths parameter must be an array.");
                throw "paths parameter must be an array.";
            }
            if (typeof paths !== "string" && Object.prototype.toString.call(paths) !== '[object Array]' || paths.length < 1) {
                console.warn("paths parameter must be an array with at least one element.");
                throw "paths parameter must be an array with at least one element.";
            }

            //if we were a string then make this an array
            if (typeof paths === "string") { paths = [paths]; }

            var templatesToLoad = paths.length;
            var templatesLoaded = [];

            $.pubsub.subscribe($.radoloTemplateLoader.TEMPLATE_LOADED, function (path, template) {
                templatesLoaded.push(template)
                if (templatesLoaded.length === templatesToLoad) {
                    if (args) {
                        args.splice(0, 0, templatesLoaded);
                    } else {
                        args = [[templatesLoaded]];
                    }
                    $.pubsub.publish($.radoloTemplateLoader.TEMPLATE_LOADED_ALL, args);
                }
            });

            $.each(paths, function (index, item) {
                $.radoloTemplateLoader.load(item, args);
            });
        }
    }
});