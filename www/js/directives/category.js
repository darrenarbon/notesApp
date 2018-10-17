app.directive('category', function() {
    return {
        restrict: 'E',
        scope: {
            info: "=",
            id: "="
        },
        templateUrl: 'js/directives/category.html',
        controller: "ListCatsController"
    };
});