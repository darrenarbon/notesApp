app.directive('note', function() {
    var controller = ['$scope', function($scope) {

    }]
    return {
        restrict: 'E',
        scope: {
            info: "=",
            id: "=",
            settings: "=",
            changeStatus: "&",
            starItem: "&",
            deleteItem: "&"
        },
        templateUrl: 'js/directives/note.html'
    };
});