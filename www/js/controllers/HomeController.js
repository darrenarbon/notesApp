app.controller('HomeController', function($scope, menuOptions, $route, speech, $location, NoteService) {

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

    $scope.deleteCompNotes = function(){
        NoteService.deleteCompNotes().then(function(){
            console.log("completed notes deleted")
        })
    };

    $scope.searchNotes = function(){
        $location.path("/categories/search/notes").search({search: $scope.searchText})
    }

    $scope.voiceAdd = function() {
        speech.getNote().then(function(data){
            NoteService.addNote(undefined, data).then(function(data){
                $scope.loadNotes();
            })
        })
    };

    $scope.go = function(path, edit) {
        defaults = {
            catid: -1
        }
        if (edit) {
            Object.keys($route.current.params).forEach(key => {
                path = path.replace(':' + key, $route.current.params[key])
            })
            Object.keys(defaults).forEach(key => {
                path = path.replace(':' + key, defaults[key])
            })
        }
        $location.path(path)
    }
});