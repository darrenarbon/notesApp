app.controller('MemoController', function($scope,dbCall, $routeParams, $timeout, $location, NoteService, $rootScope) {
    $scope.cloneSubTask = false;
    $scope.allNotes = [];
    $scope.clonableNote = {note:null};
    $scope.loading = true;

    $scope.$on('$viewContentLoaded', function() {
        NoteService.loadNotes(undefined, $routeParams.noteid).then(function(data){
            $scope.note = "";
            $scope.note = data[0];
            NoteService.loadChildNotes($routeParams.noteid).then(function(children){
                $scope.children = children;
                //$rootScope.orderByWhat = 'complete';
                NoteService.loadNotes($routeParams.catid).then(function(allNotes){
                    $scope.allNotes = allNotes;
                    $timeout(function() {
                        $scope.loading = false;
                    },0);
                })
            })
        })
    });

    //delete an item
    $scope.deleteItem = function(note) {
        note.complete = (note.complete === 0) ? 1 : 0;
        note.status_id = (note.complete === 1) ? 6 : 1;
        NoteService.deleteNote(note).then(function(data){
            $location.path("/categories/" + $routeParams.catid + "/notes")
        });
    };

    $scope.starItem = function(note) {
        note.starred = (note.starred === 0) ? 5 : note.starred = note.starred - 1;
        NoteService.starNote(note.note_id, note.starred).then(function(data){
            NoteService.ammendNoteObj(note)
        })
    };

    //function to toggle through the statuses an item can have
    $scope.changeStatus = function(note){
        //change the status incrementally, if at 5, revert to 1
        note.status_id = (note.status_id === 6) ? 1 : note.status_id + 1;
        NoteService.changeStatus(note.note_id, note.status_id).then(function(data){
            NoteService.ammendNoteObj(note)
        })
    };

    //edit the item
    $scope.editItem = function(id) {
        $location.path("/categories/" + $routeParams.catid + "/notes/" + $routeParams.noteid + "/edit")
    };

    $scope.addSubItem = function(note) {
        $location.path("/categories/" + $routeParams.catid + "/notes/newnote/" + $routeParams.noteid)
    }

    $scope.doCloneSubTask = function() {
        console.log($scope.clonableNote.note.note_id)
        NoteService.cloneSubTask($routeParams.noteid, $scope.clonableNote.note.note_id).then(function(data){
            $scope.$broadcast("$viewContentLoaded")
        })
    }
});