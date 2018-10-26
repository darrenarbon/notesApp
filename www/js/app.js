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
        .when('/day/:daynum', {
            controller: 'DayController',
            templateUrl: 'views/day.html'
        })
        .otherwise({
            redirectTo: '/categories'
        });
});

app.run(function($rootScope, NoteService, $window, dbCall) {
    dbCall.setupData().then(function(res){
        NoteService.loadSettings().then(function(result){
            $rootScope.notedSettings = result;
        });
    });

    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
        window.handleOpenURL = function(url) {
            if (url === "noted://newnote"){
                $window.location = "file:///android_asset/www/index.html#!/categories/-1/notes/newnote";
            } else if (url === "noted://priority"){
                $window.location = "file:///android_asset/www/index.html#!/categories/0/notes";
            }
        };
        var shortcut_1 = {
            id: 'add_new_note_final',
            shortLabel: 'New Note',
            longLabel: 'New note',
            iconBitmap: '',
            intent: {
                action: 'android.intent.action.RUN',
                categories: [
                    'android.intent.category.TEST', // Built-in Android category
                    'MY_CATEGORY' // Custom categories are also supported
                ],
                flags: 67108864, // FLAG_ACTIVITY_CLEAR_TOP
                data: 'noted://newnote' // Must be a well-formed URI
            }
        };
        var shortcut_2 = {
            id: 'view_priority_final',
            shortLabel: 'Priority List',
            longLabel: 'Priority List',
            iconBitmap: '',
            intent: {
                action: 'android.intent.action.RUN',
                categories: [
                    'android.intent.category.TEST', // Built-in Android category
                    'MY_CATEGORY' // Custom categories are also supported
                ],
                flags: 67108864, // FLAG_ACTIVITY_CLEAR_TOP
                data: 'noted://priority' // Must be a well-formed URI
            }
        };
        window.plugins.Shortcuts.setDynamic([shortcut_1, shortcut_2], function() {
            //window.alert('Shortcuts were applied successfully');
        }, function(error) {
            //window.alert('Error: ' + error);
        })
    }
});