function convertDate() {
    return function(value) {
        if (value === ""){
            return ""
        } else {
            return new Date(value);
        }
    };
}

angular
    .module('NotesApp')
    .filter('newDate', convertDate);

function filterNotes() {
    return function(data, showAll) {
        var returnedObjects = [];
        if (data){
            if (showAll) {
                data.forEach(function(obj) {
                    if (obj.complete === 1){
                        returnedObjects.push(obj)
                    }
                });
                return returnedObjects
            } else {
                data.forEach(function(obj) {
                    if (obj.complete === 0){
                        returnedObjects.push(obj)
                    }
                });
                return returnedObjects
            }
        }
    };
}

angular
    .module('NotesApp')
    .filter('filterNotes', filterNotes);