app.controller('DayController', function($scope, $timeout, NoteService, $routeParams, speech) {
    $scope.loading = true;
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

        $scope.currentDay = dayWantedSimple.getTime();

        //daynum in route will be days from today, 0 = today, 1 = tomorrow etc
        NoteService.loadNotes("all").then(function(data){
            $scope.notes = data.filter(function(note){
                var noteDueMS = Date.parse(note.date_due);
                if (noteDueMS >= dayWantedMS && noteDueMS < dayAfterWantedMS){
                    return true;
                }
                
            });
            $timeout(function() {
                $scope.loading = false;
            },0);
        })
    });

    $scope.voiceAdd = function(dataObj) {
        speech.getNote().then(function(data){
            if (data.date_due === "" && dataObj.date_due !== ""){
                data.date_due = new Date(dataObj.date_due)
            }
            NoteService.addNote(undefined, data).then(function(data){
                $scope.loadNotes();
            })
        })
    };
});