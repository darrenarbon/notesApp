app.controller('NewNoteController', function($scope, dbCall, $location, $routeParams, Camera, NoteService) {
    //setup blank note
    $scope.note = new NoteService.NewNoteObject("", "", "", "", "img/blank_img.png");

    //load the categories into the categories array
    NoteService.loadCategories().then(function(data){
        $scope.categories = data;

        //if this page is used for editing an item, then load that item from the DB
        if($routeParams.noteid) {
            NoteService.loadNotes(undefined, $routeParams.noteid).then(function(data){
                $scope.note = data[0];
                console.log(data[0])
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
    });



    $scope.submitNote = function(id){
        $scope.note.categories_id = ($scope.selectedCategory === undefined) ? null : $scope.selectedCategory.category_id;
        NoteService.addNote(id, $scope.note).then(function(data){
            if (id){
                $location.path("/categories/" + $routeParams.catid + "/notes/" + $routeParams.noteid)
            } else {
                $location.path("/categories/" + $routeParams.catid + "/notes/" + data.insertId)
            }
        })
    };

    //logic to take a picture with camera, uses the camera service
    $scope.takePicture = function(){
        console.log("getting camera");
        Camera.getPicture({
            quality: 75,
            targetWidth: 500,
            targetHeight: 500,
            correctOrientation: true,
            encodingType: 0,
            saveToPhotoAlbum: false
        }).then(function(imageURI) {
            $scope.note.photo = imageURI;
        }, function(err) {
            console.err(err);
        });
    };

    //logic to get a picture from photos, uses the camera service
    $scope.getPicture = function(){
        console.log("getting camera");
        Camera.getPicture({
            quality: 75,
            targetWidth: 500,
            targetHeight: 500,
            correctOrientation: true, //needed for image to be orientation it was taken
            encodingType: 0, //needed for image to be orientation it was taken
            sourceType: 0 //needed to use the camera roll as source
        }).then(function(imageURI) {
            $scope.note.photo = imageURI;
        }, function(err) {
            console.err(err);
        });
    };
});