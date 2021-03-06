app.controller('ListController', function($scope, $routeParams, NoteService, $rootScope, $timeout) {
    $scope.notes = [];
    //default view it to see all the items in the list
    $scope.show = "all";
    $scope.loading = true;

    $scope.$on('$viewContentLoaded', function() {
        //load all of the notes
        if ($routeParams.catid !== undefined) {
            if ($routeParams.catid == 0) {
                //load priority category
                NoteService.loadPriorityNotes().then(function(data) {
                    $scope.notes = data;
                    $scope.categoryName = "Priority List";
                    //$rootScope.orderByWhat = '$index'
                    $timeout(function() {
                        $scope.loading = false;
                    },0);
                })
            } else if ($routeParams.catid === "search") {
                NoteService.searchNotes($routeParams.search).then(function(data) {
                    $scope.notes = data;
                    $scope.categoryName = "Including: " + $routeParams.search;
                    $timeout(function() {
                        $scope.loading = false;
                    },0);
                })
            } else {
                //load the relevant category
                //$rootScope.orderByWhat = 'date_added_numeric';
                NoteService.loadNotes($routeParams.catid).then(function(data) {
                    $scope.notes = data;
                    //load the cat title
                    NoteService.loadCategories($routeParams.catid).then(function(data) {
                        data.push({
                            category_id: -1,
                            category_name: "Uncategorised"
                        });
                        var thisCat = data.filter(function (cat) {
                            return cat.category_id == $routeParams.catid
                        })[0];
                        $scope.categoryName = thisCat.category_name;
                        $scope.categoryId = thisCat.category_id;
                        $timeout(function() {
                            $scope.loading = false;
                        },0);
                    });
                })
            }
        } else if ($routeParams.statusid !== undefined) {
            NoteService.loadStatusNotes($routeParams.statusid).then(function(data) {
                $scope.notes = data;
                $scope.categoryName = $routeParams.name;
                $timeout(function() {
                    $scope.loading = false;
                },0);
            })
        } else if ($routeParams.priorityid !== undefined) {
            NoteService.loadPriorityNotes($routeParams.priorityid).then(function(data) {
                $scope.notes = data;
                $scope.categoryName = "Priority: " + $routeParams.priorityid;
                $timeout(function() {
                    $scope.loading = false;
                },0);
            })
        }
    });

    $scope.loadCompleted = function(){
        console.log("load");
        NoteService.loadNotes($routeParams.catid, undefined, true).then(function(data) {
            $scope.completed_notes = data;
        })
    };

    //delete an item
    $scope.deleteItem = function(note, $event) {
        $event.stopPropagation();
        $event.preventDefault();
        note.complete = (note.complete === 0) ? 1 : 0;
        note.status_id = (note.complete === 1) ? 6 : 1;
        NoteService.deleteNote(note).then(function(data){
            NoteService.ammendNoteObj(note)
        });
    };

    //star an item
    $scope.starItem = function(note, $event) {
        $event.stopPropagation();
        $event.preventDefault();
        note.starred = (note.starred === 0) ? 5 : note.starred = note.starred - 1;
        NoteService.starNote(note.note_id, note.starred).then(function(data){
            NoteService.ammendNoteObj(note)
        })
    };

    //function to toggle through the statuses an item can have
    $scope.changeStatus = function(note, $event) {
        $event.stopPropagation();
        $event.preventDefault();
        //change the status incrementally, if at 5, revert to 1
        note.status_id = (note.status_id === 6) ? 1 : note.status_id + 1;
        NoteService.changeStatus(note.note_id, note.status_id).then(function(data) {
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
});