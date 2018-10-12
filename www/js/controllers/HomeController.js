app.controller('HomeController', function($scope, menuOptions, $rootScope, dbCall, $location) {
    //run the setup
    dbCall.setupData();

    $rootScope.orderByWhat = "note_id";
    $rootScope.reverse = false;

    //hide the menu
    $scope.showMenu = false;

    //function to toggle menu view
    $scope.showHideMenu = function(){
        $scope.showMenu = !$scope.showMenu
    };

    //function to change global variable based on the check box
    $scope.showHideItems = function(){
        $rootScope.showAllItemsInDisplay = $scope.allItems
    };

    $scope.changeSort = function(type) {
        if (type === $rootScope.orderByWhat){
            //same option so reverse the order
            $rootScope.reverse = !$rootScope.reverse
        } else {
            $rootScope.reverse = false
        }
        $rootScope.orderByWhat = type;
        $scope.showHideMenu()
    };

    //function to recreate all data.
    $scope.resetDataBase = function(){
        dbCall.resetDBs();
        $scope.showHideMenu();
        $location.path("/notessfdgvd")
    };
});