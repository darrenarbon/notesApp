app.service('checkDates', function () {
    this.checkOverDue = function(date) {
        var now = new Date()
        date = new Date(date)
        if (now.getFullYear() === date.getFullYear() && now.getMonth() === date.getMonth() && now.getDate() === date.getDate()) {
            //same day
            return "noteDueToday"
        } else if (Date.parse(now) > Date.parse(date)){
            return "noteOverdue"
        } else if (now.getFullYear() === date.getFullYear() && now.getMonth() === date.getMonth() && (now.getDate()+1) === date.getDate()){
            //due tomorrow - small bug if the end of the year.... could use moment.js to fix if needed
            return "noteDueTomorrow"
        }
    }
});