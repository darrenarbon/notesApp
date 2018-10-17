app.controller('ListController', function($scope, $routeParams, speech, NoteService,$rootScope) {
    $scope.notes = [];
    //default view it to see all the items in the list
    $scope.show = "all";

    //load all of the notes
    if ($routeParams.catid == 0){
        //load priority category
        NoteService.loadPriorityNotes().then(function(data){
            $scope.notes = data;
            $scope.categoryName = "Priority List";
        })
    } else {
        //load the relevant category
        NoteService.loadNotes($routeParams.catid).then(function(data){
            $scope.notes = data;
            //load the cat title
            NoteService.loadCategories().then(function(data){
                data.push({
                    category_id: 99999,
                    category_name: "Uncategorised"
                });
                var thisCat = data.filter(function (cat) {
                    return cat.category_id == $routeParams.catid
                })[0];
                $scope.categoryName = thisCat.category_name;
                $scope.categoryId = thisCat.category_id;
            });
        })
    }

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
});