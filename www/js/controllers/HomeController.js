app.controller('HomeController', function($scope, menuOptions, $rootScope, dbCall, $location, NoteService) {

    //dbCall.add("notes", {title: "1 - New Note", notes: "Something great", categories_id: 1, complete: 0, status_id: 4}).then(function(response){
    //    console.log(response)
    //})
    //dbCall.add("notes", {title: "2- New Note", notes: "Something great", categories_id: 1, complete: 0, status_id: 4}).then(function(response){
    //    console.log(response)
    //})
    //dbCall.add("notes", {title: "3 - New Note", notes: "Something great", categories_id: 2, complete: 0, status_id: 4}).then(function(response){
    //    console.log(response)
    //})
    //
    //dbCall.add("categories", {category_name: "Main List", category_color: "#00FF00"}).then(function(response){
    //    console.log(response)
    //})
    //
    //dbCall.add("categories", {category_name: "Sub List", category_color: "#00FF00"}).then(function(response){
    //    console.log(response)
    //})

    //dbCall.update("notes", 3, [["title", "Third One"]]).then(function(response){
    //    console.log(response)
    //})

    //dbCall.getJoinedData(["notes", "categories", "status"], 1, "note_id", [{pri_table: 'notes', pri_col: 'categories_id', other_table: 'categories', other_col: 'category_id'}, {pri_table: 'notes', pri_col: 'status_id', other_table: 'status', other_col: 'status_id'}]).then(function(response){
    //    console.log(response)
    //});

    //dbCall.getAllData("categories", "category_id", 2).then(function(result) {
    //    console.log(result)
    //});
    //dbCall.getAllData("categories").then(function(result) {
    //    console.log(result)
    //});

    $rootScope.orderByWhat = "date_added_numeric";
    $rootScope.reverse = false;

    //function to change global variable based on the check box
    $scope.changeSort = function(type, $event) {
        var oMenuDivs = document.querySelectorAll(".menuSubOptionSelected");
        if(oMenuDivs.length > 0){
            oMenuDivs.forEach(function(oDiv){
                oDiv.classList.remove("menuSubOptionSelected", "menuSubOptionAsc", "menuSubOptionDesc");
            })
        }
        if (type === $rootScope.orderByWhat && $rootScope.reverse === false){
            //same option so reverse the order
            $rootScope.reverse = !$rootScope.reverse;
            $event.target.classList.add("menuSubOptionDesc", "menuSubOptionSelected");
        } else {
            $rootScope.reverse = false;
            $event.target.classList.add("menuSubOptionAsc", "menuSubOptionSelected");
        }
        $rootScope.orderByWhat = type;
    };

    $scope.changeSettings = function(){
        NoteService.saveSettings($rootScope.notedSettings).then(function(){
            console.log("settings changed")
        });
    };

    $scope.deleteCompNotes = function(){
        NoteService.deleteCompNotes().then(function(){
            console.log("completed notes deleted")
        })
    };
});