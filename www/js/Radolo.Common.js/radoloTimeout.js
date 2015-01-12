/// <reference path="radoloCommon.js" />


(function ($) {
    ///<param name="$" type="jQuery" />  
    var SECOND = 1000;
    var MINUTE = 60000;

              
    var POPUP_WINDOW_SHOW = MINUTE * 25; //25 minutes
    var FINAL_TIMEOUT = MINUTE * 30; //30 minutes
     
    var sessionTimer = new Date();
    $(document).ajaxStart(function () {
        //reset the start time if we make an ajax call
        sessionTimer = new Date();
    });

    $.extend({
        radoloTimeout: {  
            setFinalTimeOut:function(timeInMinutes){
                //this is the amount of time to elapse before we do the logout
                FINAL_TIMEOUT = MINUTE * timeInMinutes;
            },
            setPopupWindowShow:function(timeInMinutes){
                //this is the amount of time to elapse before we display the dialog
                POPUP_WINDOW_SHOW = MINUTE * timeInMinutes;
            },
            logout : function() {
                $.radoloCommon.showWait();
                $.ajax({
                    cache: false,
                    async: false,
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    url: '/Services/PublicAPI.svc/LogOut?autologout=autologout'
                }).done(function (e) {
                    $.radoloCommon.clearCurrentPerson();
                    window.location.href = "/";
                }).fail($.radoloCommon.showError);
            },
            secondaryCountDown: function(popup) {
                var remainingTimeString = $.radoloCommon.formatSeconds(FINAL_TIMEOUT - (new Date() - sessionTimer));

                popup.element.find('#spanTimeout').text(remainingTimeString);

                if (new Date() - sessionTimer >= FINAL_TIMEOUT) {
                    //we need to actually log out!
                    $.radoloTimeout.logout();
                    return;
                }

                //we need to keep counting
                setTimeout(function () { $.radoloTimeout.secondaryCountDown(popup); }, SECOND); //check once a second
            },
            mainCountDown:function() {
                //start counting down from the start time
                //if we go longer than 1 hour, then display the timeout page
                if (new Date() - sessionTimer >= POPUP_WINDOW_SHOW) {
                    //we are over time so we need to pop the dialog
                    var win = $.radoloDialog.showAsWindow({ title: 'Session Timeout', message: "You have been inactive for some time. Your session will time out in <span id='spanTimeout'/>. Let us know if you are still out there!",
                        buttons: [{
                            title: 'Don\'t log me out',
                            callback: function () {
                                //reset the timer and start the interval clock again
                                sessionTimer = new Date();
                                setTimeout($.radoloTimeout.mainCountDown, MINUTE); //check once a minute

                                //close the window
                                $.radoloDialog.closeWindow();
                            }
                        }, {
                            title: 'Log me out', callback: $.radoloTimeout.logout
                        }]
                    });
                    $.radoloTimeout.secondaryCountDown(win);
                    return;
                }

                //we need to keep the timer going, because we have not timed out yet
                setTimeout($.radoloTimeout.mainCountDown, MINUTE); //check once a minute
            }
        }
    }); 

    //start the time
    if ($.radoloCommon.getCurrentPerson() != null && $.radoloCommon.getCurrentPerson().ID > 0) {
        setTimeout($.radoloTimeout.mainCountDown, MINUTE); //check once a minute
    }

})(jQuery);