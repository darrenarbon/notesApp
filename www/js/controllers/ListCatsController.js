app.controller('ListCatsController', function($scope, $location, speech, NoteService, NotesDAO) {
    $scope.categories = [];

    NoteService.loadCategories(undefined, true).then(function(data){
        $scope.categories = data;
    })

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
});