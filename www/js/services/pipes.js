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