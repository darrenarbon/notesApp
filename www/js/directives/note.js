app.directive('note', function() {
    return {
        restrict: 'E',
        scope: {
            info: "=",
            id: "="
        },
        templateUrl: 'js/directives/note.html',
        controller: "ListController"
    };
});