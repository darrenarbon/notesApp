app.controller('CategoryController', function($scope, dbCall, $location, NoteService) {
    NoteService.loadCategories().then(function(data){
        $scope.categories = data
    });

    //add a new category
    $scope.addNewCat = function(){
        dbCall.modifyData("insert into categories (category_name, category_colour) values (?,?)", [$scope.catText, $scope.catColour]).then(function(result) {
            $scope.catText = ""
            $scope.catColour = ""
            $scope.loadCats()
        })
    }

    //delete a category
    $scope.deleteCat = function(id){
        dbCall.modifyData("delete from categories where category_id=?", [id]).then(function(result) {
            $scope.loadCats()
        })
    }
});