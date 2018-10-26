app.controller('DayController', function($scope, $location, NoteService, $routeParams, $filter) {
    $scope.$on('$viewContentLoaded', function() {
        //sort the dates out
        var dayWanted = new Date();
        dayWanted.setDate(dayWanted.getDate() + parseInt($routeParams.daynum));
        var dayWantedSimple = new Date(dayWanted.getFullYear(), dayWanted.getMonth(), dayWanted.getDate());
        var dayWantedMS = Date.parse(dayWantedSimple);

        var dayAfterWanted = new Date();
        dayAfterWanted.setDate(dayAfterWanted.getDate() + parseInt($routeParams.daynum)+1);
        var dayAfterWantedSimple = new Date(dayAfterWanted.getFullYear(), dayAfterWanted.getMonth(), dayAfterWanted.getDate());
        var dayAfterWantedMS = Date.parse(dayAfterWantedSimple);

        $scope.currentDay = $filter('date')(dayWantedSimple, "mediumDate");

        //daynum in route will be days from today, 0 = today, 1 = tomorrow etc
        NoteService.loadNotes("all").then(function(data){
            $scope.notes = data.filter(function(note){
                var noteDueMS = Date.parse(note.date_due);
                if (noteDueMS >= dayWantedMS && noteDueMS < dayAfterWantedMS){
                    return true;
                }
            });
        })
    })
});