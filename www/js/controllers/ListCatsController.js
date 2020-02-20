app.controller('ListCatsController', function($scope, $location, speech, NoteService, CalendarService, $rootScope, $timeout) {
    $scope.categories = [];
    $scope.loading = true;

    $scope.$on('SettingsLoaded', function() {
        loadData()
    });

    $scope.$on('$viewContentLoaded', function() {
        if ($rootScope.notedSettings){
            loadData()
        }
    });

    function loadData(){
        console.log("ListCatsController.loadData")
        NoteService.loadCategories(undefined, true).then(function(data){
            $scope.categories = data;
            if ($rootScope.notedSettings.show_5_days === true){
                CalendarService.create5Days().then(function(data){
                    $scope.days = data;
                    $timeout(function() {
                        $scope.loading = false;
                    },0);
                })
            } else {
                $scope.days = []
                $timeout(function() {
                    $scope.loading = false;
                },0);
            }
        });
    }

    //delete an item
    $scope.deleteCat = function(cat, $event) {
        console.log("hi")
        $event.stopPropagation();
        $event.preventDefault();
        NoteService.deleteCategory(cat).then(function(data){
            cat.expired = 1;
        })
    };

    //edit an item
    $scope.editCat = function(cat, $event) {
        $event.stopPropagation();
        $event.preventDefault();
        $location.path("/categories/" + cat.category_id + "/edit");
    };

    $scope.voiceAdd = function() {
        speech.getNote().then(function(data){
            NoteService.addNote(undefined, data).then(function(data){
                $scope.loadNotes();
            })
        })
    };

    $scope.addNewNoteToDay = function(day, $event){
        $event.stopPropagation();
        $event.preventDefault();
        $location.path("/categories/-1/notes/newnote").search({day: day})
    }
});