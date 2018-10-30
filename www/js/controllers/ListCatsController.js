app.controller('ListCatsController', function($scope, $location, speech, NoteService, CalendarService, $rootScope) {
    $scope.categories = [];

    $scope.$on('SettingsLoaded', function() {
        loadData()
    });

    $scope.$on('$viewContentLoaded', function() {
        if ($rootScope.notedSettings){
            loadData()
        }
    });

    function loadData(){
        NoteService.loadCategories(undefined, true).then(function(data){
            $scope.categories = data;
            if ($rootScope.notedSettings.show_5_days === true){
                CalendarService.create5Days().then(function(data){
                    $scope.days = data;
                })
            } else {
                $scope.days = []
            }
        });
    }

    //delete an item
    $scope.deleteCat = function(category, $event) {
        $event.stopPropagation();
        $event.preventDefault();
        NoteService.deleteCategory(category).then(function(data){
            category.expired = 1;
        })
    };

    //edit an item
    $scope.editCat = function(category_id, $event) {
        $event.stopPropagation();
        $event.preventDefault();
        $location.path("/categories/" + category_id + "/edit");
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