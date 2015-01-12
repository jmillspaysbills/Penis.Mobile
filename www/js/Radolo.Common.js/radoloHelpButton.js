/// <reference path="radoloDialog.js" />

(function () {
	var kendo = window.kendo,
		ui = kendo.ui,
		Widget = ui.Widget,
		support = kendo.support,
		ns = ".radoloHelpButton",
		CLICK = "click";

	var HelpButton = Widget.extend({
		init: function (element, options) {

			//check and see if we should be showing these
			var pref = $.radoloCommon.getUserPreference("hideHelpTips");
			if (pref && pref.Value === false) {
				$(element).remove();
				return;
			}

			var that = this;

			that._initializing = true;

			kendo.ui.Widget.fn.init.call(that, element, options);

			element = that.element;
			options = that.options;

			globalElement = element;

			if (options.helpname !== '') {

			    element.addClass('radoloHelpButton').parent().addClass('radoloHelpButtonParent');

				that._helpUrl = '/' + options.helpname + '.help';

				that.button = $('<a>?</a>')
								.attr('href', that._helpUrl)
								.appendTo(element);

				that.button.on(CLICK + ns, $.proxy(that._click, that));
				that.element.on(CLICK + ns, $.proxy(that._click, that));
			}
			else {
				console.warn("options.helpname must be provided for Radolo Help Buttons.");
				that.hide();
				throw "options.helpname must be provided for Radolo Help Buttons.";
			}

			//notify that... i have no idea what this does...thanks for the documentation kendo :(
			kendo.notify(that);
			that._initializing = false;
		},
		options: {
			name: "HelpButton",
			helpname: ""
		},
		_data: null,
		_showData: function () {
			var that = this;
			$.radoloDialog.showAsWindow({
				title: 'Help',
				message: that._data,
				classes: "radoloHelpDialog",
				showClose: ['Close']
			});
		},
		_click: function (e) {
			//short circuit the link
			e.preventDefault();
			e.stopPropagation();

			var that = this;

			if (that._data !== null) {
				that._showData(e);
				return false;
			}

			//this is where we get the data and show it
			$.ajax({
				type: "GET",
				async: true,
				cache: true,
				url: that._helpUrl
			}).done(function (results) {
				that._data = results;
				that._showData(e);
			});

			return false;
		}
	});

	ui.plugin(HelpButton);

})(jQuery);
