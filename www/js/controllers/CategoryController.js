app.controller('CategoryController', function($scope, dbCall, $location, NoteService, $routeParams) {
    $scope.buttonLabel = ($routeParams.catid) ? "Update Category" : "Add Category"

    if ($routeParams.catid) {
        NoteService.loadCategories($routeParams.catid).then(function(data){
            $scope.category = data[0];
        });
    }

    $scope.submitCategory = function(catId) {
        NoteService.addCategory(catId, $scope.category).then(function(data){
            if (catId){
                $location.path("/categories/" + catId + "/notes")
            } else {
                $location.path("/categories/" + data.insertId + "/notes")
            }
        })
    }
});