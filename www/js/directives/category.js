app.directive('category', function($rootScope) {
    return {
        restrict: 'E',
        scope: {
            info: "=",
            id: "=",
            settings: "=",
            deleteCat: "&",
            editCat: "&"
        },
        templateUrl: 'js/directives/category.html'
    };
});