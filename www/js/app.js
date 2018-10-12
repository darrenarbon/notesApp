var app = angular.module('NotesApp', ['ngRoute', 'angular.filter']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/notes', {
            controller: 'ListController',
            templateUrl: 'views/list.html'
        })
        .when('/notes/:id', {
            controller: 'MemoController',
            templateUrl: 'views/ind_memo.html'
        })
        .when('/notes/:id/edit', {
            controller: 'NewNoteController',
            templateUrl: 'views/newnote.html'
        })
        .when('/newnote', {
            controller: 'NewNoteController',
            templateUrl: 'views/newnote.html'
        })
        .when('/categories', {
            controller: 'CategoryController',
            templateUrl: 'views/categories.html'
        })
        .otherwise({
            redirectTo: '/notes'
        });
});

app.run(function($rootScope) {
    $rootScope.showAllItemsInDisplay = false
});
