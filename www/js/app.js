var app = angular.module('NotesApp', ['ngRoute', 'angular.filter']);

app.config(function ($routeProvider) {
    $routeProvider
        //list the categories
        .when('/categories', {
            controller: 'ListCatsController',
            templateUrl: 'views/list_cats.html'
        })
        //add a new category
        .when('/categories/new', {
            controller: 'CategoryController',
            templateUrl: 'views/categories.html'
        })
        //edit a category
        .when('/categories/:catid/edit', {
            controller: 'CategoryController',
            templateUrl: 'views/categories.html'
        })
        //list the notes in a category
        .when('/categories/:catid/notes', {
            controller: 'ListController',
            templateUrl: 'views/list.html'
        })
        //add a new note to a category
        .when('/categories/:catid/notes/newnote', {
            controller: 'NewNoteController',
            templateUrl: 'views/newnote.html'
        })
        //view a particular note
        .when('/categories/:catid/notes/:noteid', {
            controller: 'MemoController',
            templateUrl: 'views/ind_memo.html'
        })
        .when('/categories/:catid/notes/:noteid/edit', {
            controller: 'NewNoteController',
            templateUrl: 'views/newnote.html'
        })
        .otherwise({
            redirectTo: '/categories'
        });
});

app.run(function($rootScope) {
    $rootScope.showAllItemsInDisplay = false
});
