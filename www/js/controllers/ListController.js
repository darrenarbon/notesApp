app.controller('ListController', function($scope, $location, speech, NoteService,$rootScope) {
    $scope.notes = [];
    //default view it to see all the items in the list
    $scope.show = "all";

    //load all of the notes
    $scope.loadNotes = function() {
        NoteService.loadNotes().then(function(data){
            $scope.notes = data;
            console.log(data)
        })
    };

    //function to show only the priority items.
    $scope.loadPriority = function() {
        NoteService.loadPriorityNotes().then(function(data){
            $scope.notes = data
        })
    };

    //allows the user to switch between priority view and all view
    $scope.toggleView = function(){
        if($scope.show === "all"){
            $scope.loadPriority();
            $scope.show = "priority"
        } else if ($scope.show === "priority") {
            $scope.loadNotes();
            $scope.show = "all"
        }
    };

    //delete an item
    $scope.deleteItem = function(note, $event) {
        $event.stopPropagation();
        $event.preventDefault();
        note.complete = (note.complete === 0) ? 1 : 0;
        NoteService.deleteNote(note.note_id, note.complete).then(function(data){
            NoteService.ammendNoteObj(note)
        });
    };

    //star an item
    $scope.starItem = function(note, $event) {
        $event.stopPropagation();
        $event.preventDefault();
        note.starred = (note.starred === 0) ? 1 : 0;
        NoteService.starNote(note.note_id, note.starred).then(function(data){
            NoteService.ammendNoteObj(note)
        })
    };

    //function to toggle through the statuses an item can have
    $scope.changeStatus = function(note, $event){
        $event.stopPropagation();
        $event.preventDefault();
        //change the status incrementally, if at 5, revert to 1
        note.status_id = (note.status_id === 5) ? 1 : note.status_id + 1;
        NoteService.changeStatus(note.note_id, note.status_id).then(function(data){
            NoteService.ammendNoteObj(note)
        })
    };

    //watch the toggle for all items to be displayed, then fire the relevant functions
    //NEEDS WORK AS NOT PERFECT
    $scope.$watch("showAllItemsInDisplay", function handleTimerChange(newValue, oldValue) {
        if(newValue || oldValue) {
            $scope.$parent.showHideMenu();
        }
    });

    $scope.voiceAdd = function() {
        speech.getNote().then(function(data){
            NoteService.addNote(undefined, data).then(function(data){
                $scope.loadNotes();
            })
        })
    };

    $scope.loadNotes()
});