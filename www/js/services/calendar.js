app.service('CalendarService', function (dbCall, $rootScope, $q, checkDates) {
    CalendarService = this;

    this.addEvent = function(data, allowed){
        return $q(function (resolve, reject) {
            if (parseInt(data.add_to_calendar) === 1 && data.date_due && allowed){
                //delete any already active events as cannot overwrite yet
                if(data.calendar_id){
                    CalendarService.deleteEvent(data.calendar_id);
                }

                getPrimaryCalendar().then(function(id) {
                    var calOptions = window.plugins.calendar.getCalendarOptions();
                    calOptions.calendarId = id;
                    window.plugins.calendar.createEventWithOptions(data.title, '', data.notes, data.date_due, data.date_due, calOptions, function(msg){
                        resolve(msg)
                    }, onError);
                })
            } else {
                resolve(null)
            }
        });
    };

    this.deleteEvent = function(data){
        window.plugins.calendar.deleteEventById(data, '', function(suc){
            console.log(suc)
        }, function(err){
            console.log(err)
        })
    };

    this.create5Days = function(){
        return $q(function (resolve, reject) {
            NoteService.loadNotes("alldue").then(function (notes) {
                var aMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                var aColours = ["rgba(255,0,0, 0.25)", "rgba(255,158,0, 0.25)", "rgba(255,255,0, 0.25)", "rgba(127,255,0, 0.25)", "rgba(0,255,0, 0.25)"];
                days = [];
                for (var i = 0; i < 5; i++) {
                    var dayWanted = new Date();
                    dayWanted.setDate(dayWanted.getDate() + i);
                    var dayNumbers = (dayWanted.getDate() < 10) ? '0' + dayWanted.getDate() : dayWanted.getDate();
                    var notesDueThisDay = notes.filter(function(note){
                        var noteDate = new Date(note.date_due);
                        return (dayWanted.getFullYear() === noteDate.getFullYear() && dayWanted.getMonth() === noteDate.getMonth() && dayWanted.getDate() === noteDate.getDate())
                    });
                    days.push({date: dayNumbers, month: aMonths[dayWanted.getMonth()], colour: aColours[i], notesDue: notesDueThisDay.length, fullDate: dayWanted.getTime()})
                }
                resolve(days);
            });
        })
    };

    function onSuccess(msg) {
        console.log('Calendar success: ' + msg);
    }

    function onError(msg) {
        console.log('Calendar error: ' + JSON.stringify(msg));
    }

    function getPrimaryCalendar(){
        return $q(function (resolve, reject) {
            window.plugins.calendar.listCalendars(function (cals) {
                cals.forEach(function (cal) {
                    if (cal.isPrimary === true) {
                        resolve(cal.id);
                    }
                })
            }, makePrimary);
            function makePrimary() {
            }
        })
    }
});