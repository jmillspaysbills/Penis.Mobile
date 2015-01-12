/*	

jQuery pub/sub plugin by Peter Higgins (dante@dojotoolkit.org)

Loosely based on Dojo publish/subscribe API, limited in scope. Rewritten blindly.

Original is (c) Dojo Foundation 2004-2010. Released under either AFL or new BSD, see:
http://dojofoundation.org/license for more information.

*/
(function (d) {
    $.extend({
        pubsub: {
            // the topic/subscription hash
            cache: {},
            clear: function (topic) {
                topic = (topic || "").toLowerCase(); //make sure we are lowercase, just so we don't have to worry about sloppy codeing :(
                
                $.pubsub.cache[topic] = [];                
            },
            publish: function (/* String */topic, /* Array? */args) {
                /// <summary>
                ///		Publish some data on a named topic.
                /// </summary>
                /// <param name="topic" type="String">
                ///     The channel to publish on
                /// </param>
                /// <param name="args" type="Array?">
                ///     The data to publish. Each array item is converted into an ordered
                ///		arguments on the subscribed functions.
                /// </param>
                /// <example>
                ///		Publish stuff on '/some/topic'. Anything subscribed will be called
                ///		with a function signature like: function(a,b,c){ ... }
                ///
                ///			$.pubsub.publish("/some/topic", ["a","b","c"]);
                /// </example>

                topic = (topic || "").toLowerCase(); //make sure we are lowercase, just so we don't have to worry about sloppy codeing :(
                $.pubsub.cache[topic] && $.each($.pubsub.cache[topic], function (index, item) {

                    //if this is not an array, then force it to be an array
                    if (!$.isArray(args)) { args = [args]; }

                    item.apply($, args || []);
                });
            },
            subscribe: function (/* String */topic, /* Function */callback, singleListenerAllowed) {
                /// <summary>
                ///		Register a callback on a named topic.
                /// </summary>        
                /// <param name="topic" type="String">
                ///		The channel to subscribe to
                /// </param>
                /// <param name="callback" type="Function">        
                ///		The handler event. Anytime something is $.pubsub.publish'ed on a 
                ///		subscribed channel, the callback will be called with the
                ///		published array as ordered arguments.
                /// </param>
                /// <returns>
                ///     Array
                ///		A handle which can be used to unsubscribe this particular subscription.
                /// </returns>
                /// <example>
                ///		$.pubsub.subscribe("/some/topic", function(a, b, c){ /* handle data */ });
                /// </example>

                topic = (topic || "").toLowerCase(); //make sure we are lowercase, just so we don't have to worry about sloppy codeing :(

                //check to see if they only want to allow a single listener, if they did then only have a single copy available
                if (singleListenerAllowed) {
                    $.pubsub.clear(topic);
                }
                else {
                    //they want to allow multiple
                    //so only init if one does not exist
                    if (!$.pubsub.cache[topic]) {
                        $.pubsub.clear(topic);
                    }
                }

                $.pubsub.cache[topic].push(callback);
                return [topic, callback]; // Array
            },
            subscribeSingle: function (/* String */topic, /* Function */callback) {
                /// <summary>
                ///		Register a callback on a named topic. and ensures it is the only callback
                /// </summary>        
                /// <param name="topic" type="String">
                ///		The channel to subscribe to
                /// </param>
                /// <param name="callback" type="Function">        
                ///		The handler event. Anytime something is $.pubsub.publish'ed on a 
                ///		subscribed channel, the callback will be called with the
                ///		published array as ordered arguments.
                /// </param>
                /// <returns>
                ///     Array
                ///		A handle which can be used to unsubscribe this particular subscription.
                /// </returns>
                /// <example>
                ///		$.pubsub.subscribeSingle("/some/topic", function(a, b, c){ /* handle data */ });
                /// </example>

                return $.pubsub.subscribe(topic, callback, true);
            },
            unsubscribe: function (/* Array */handle) {
                /// <summary>
                ///	Disconnect a subscribed function for a topic.
                /// </summary>
                /// <param name="handle" type="Array">          
                ///		The return value from a $.pubsub.subscribe call.
                /// </param>
                /// <example>
                ///		var handle = $.pubsub.subscribe("/something", function(){});
                ///		$.pubsub.unsubscribe(handle);
                /// </example>
                var topic = handle[0];
                topic = (topic || "").toLowerCase(); //make sure we are lowercase, just so we don't have to worry about sloppy codeing :(

                var items = $.pubsub.cache[topic];
                if (items) {
                    //we actually want to loop from the end and remove instead of an each, since it was messing up the iterators
                    for (var idx = items.length - 1; idx >= 0; idx--) {
                        var item = items[idx];
                        if (item === handle[1]) {
                            items.splice(idx, 1);
                        }
                    }
                }
            }
        }
    });
})(jQuery);
