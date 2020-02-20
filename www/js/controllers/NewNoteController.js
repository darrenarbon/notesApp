app.controller('NewNoteController', function($scope, dbCall, $location, $routeParams, Camera, NoteService, NotesDAO) {
    $scope.$on('$viewContentLoaded', function() {
        //setup blank note
        var dueDate;
        if ($location.search()['day']){
            dueDate = new Date(parseInt($location.search()['day']));
        }
        $scope.note = new NoteService.NewNoteObject("", "", dueDate, "-1", "img/blank_img.png");

        NotesDAO.loadSettings().then(function(result){
            $scope.notedSettings = result[0]
        });

        //load the categories into the categories array
        NoteService.loadCategories(null, false, true).then(function(data){
            $scope.categories = data;

            //if this page is used for editing an item, then load that item from the DB
            if($routeParams.noteid) {
                NoteService.loadNotes(undefined, $routeParams.noteid).then(function(data){
                    $scope.note = data[0];
                    $scope.buttonLabel = "Update Note";
                    //render the date as an actual date
                    $scope.note.date_due = ($scope.note.date_due) ? new Date($scope.note.date_due) : "";
                    //if there is an image, then set the classes for the image
                    $scope.note.imageClass = ($scope.note.photo) ? "img-fluid img-thumbnail" : "";
                    //set the selected option for the category dropdown
                    $scope.selectedCategory = $scope.categories.filter(function(cat) {
                        return cat.category_id === $scope.note.categories_id
                    })[0]
                });
            } else {
                $scope.buttonLabel = "Add Note";
                $scope.selectedCategory = $scope.categories.filter(function(cat) {
                    return cat.category_id == $routeParams.catid
                })[0]
            }
            if($routeParams.parentnoteid){
                $scope.note.parent_note_id = $routeParams.parentnoteid;
            }
        });
    });

    $scope.submitNote = function(id){
        $scope.note.categories_id = ($scope.selectedCategory === undefined) ? null : $scope.selectedCategory.category_id;
        NoteService.addNote(id, $scope.note).then(function(data){
            if ($scope.note.parent_note_id){
                $location.path("/categories/" + $scope.note.categories_id + "/notes/" + $scope.note.parent_note_id)
            } else {
                $location.path("/categories/" + $scope.note.categories_id + "/notes/")
            }
        })
    };

    //logic to take a picture with camera, uses the camera service
    $scope.getImage = function(whereFrom){
        var settingsObject = {
            quality: 75,
            targetWidth: 500,
            targetHeight: 500,
            correctOrientation: true, //needed for image to be orientation it was taken
            encodingType: 0 //needed for image to be orientation it was taken
        };
        if (whereFrom === "photo"){
            settingsObject.saveToPhotoAlbum = false;
        } else if (whereFrom === "library"){
            settingsObject.sourceType = 0; //needed to use the camera roll as source
        }
        Camera.getPicture(settingsObject).then(function(imageURI) {
            $scope.note.photo = imageURI;
        }, function(err) {
            console.err(err);
        });
    };

    $scope.checkAddNew = function(){
        if($scope.selectedCategory.category_id === -2){
            navigator.notification.prompt(
                'What is the name of the list?',
                fnAddNew,
                "New List",
                ['Add', 'Cancel'],
                ""
            );
            function fnAddNew(prompt){
                if(prompt.buttonIndex === 1){
                    var newCat = {category_name: prompt.input1, category_colour: "#6495ed"};
                    NoteService.addCategory(null, newCat).then(function(newID){
                        newCat.category_id = newID.insertId;
                        $scope.categories.splice($scope.categories.length-1, 0, newCat);
                        $scope.selectedCategory = newCat
                    })
                }
            }
        }
    }
});